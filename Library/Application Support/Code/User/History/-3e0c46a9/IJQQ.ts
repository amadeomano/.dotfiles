import download from 'downloadjs';
import { toSvg } from 'html-to-image';
import { type TFunction } from 'i18next';
import { getRectOfNodes, getTransformForBounds, type Node } from 'reactflow';

import { toaster } from 'designSystem/component/toaster';

import {
  EXPORT_FILENAME,
  EXPORT_MAX_ZOOM,
  EXPORT_MIN_ZOOM,
  EXPORT_ONE_NODE_PADDING,
  EXPORT_PADDING,
  EXPORTING_CLASS,
  VIEWPORT_CLASS,
} from '../constants';
import { type BaseData, ExportFormat } from '../types';

type ExportOptions = NonNullable<Parameters<typeof toSvg>[1]>;

async function toPngWithEncodingFix(node: HTMLElement, options: ExportOptions) {
  const svgString = await toSvg(node, options);

  // Inject XML declaration (Safari fix)
  const encodedPrefix = '<?xml version="1.0" encoding="iso-8859-1"?>';
  const fixedSvgString = encodedPrefix + svgString;

  const encodedSvg = encodeURIComponent(fixedSvgString);
  const dataUrl = 'data:image/svg+xml;charset=iso-8859-1,' + encodedSvg;

  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        resolve(blob);
      });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

const defaultExportOptions: ExportOptions = {
  cacheBust: true,
  fontEmbedCSS: '',
};

const formatExportOptions: Record<ExportFormat, ExportOptions> = {
  [ExportFormat.PNG_BG]: {
    ...defaultExportOptions,
    backgroundColor: '#ffffff',
  },
  [ExportFormat.PNG]: defaultExportOptions,
  [ExportFormat.SVG]: defaultExportOptions,
  [ExportFormat.PDF]: defaultExportOptions,
};

const toFormat = {
  [ExportFormat.PNG_BG]: toPngWithEncodingFix,
  [ExportFormat.PNG]: toPngWithEncodingFix,
  [ExportFormat.SVG]: toSvg,
  [ExportFormat.PDF]: toPngWithEncodingFix,
};

type ExportNodes<T> = {
  format: ExportFormat;
  nodes: Node<T>[];
  onFinish: () => void;
  DOMNode?: HTMLElement;
  fileName?: string;
  t: TFunction<'employees-organizations', 'org-chart.errors'>;
};

const observeDOMSettling = (
  targetNode: HTMLElement,
  callback: () => void,
  settleTime = 500,
): Promise<void> => {
  return new Promise((resolve) => {
    let settleTimeout: NodeJS.Timeout;

    const callCallback = () => {
      observer.disconnect();
      callback();
      resolve();
    };

    const observer = new MutationObserver(() => {
      clearTimeout(settleTimeout);
      clearTimeout(noChangeTimeout);

      settleTimeout = setTimeout(callCallback, settleTime);
    });
    observer.observe(targetNode, { childList: true, subtree: true });

    // For smaller charts probably no mutation will happen.
    // if no mutation in half a second happens, we consider it to be small chart
    const noChangeTimeout = setTimeout(callCallback, settleTime);
  });
};

export async function exportNodes<T extends BaseData>({
  format,
  nodes,
  onFinish,
  // Fallbacks to the document's as a last resort
  DOMNode = document.querySelector<HTMLDivElement>(VIEWPORT_CLASS) ??
    document.body,
  fileName = EXPORT_FILENAME,
  t,
}: ExportNodes<T>): Promise<void> {
  const toImage = toFormat[format] || toPngWithEncodingFix;
  const baseExportOptions = formatExportOptions[format] || defaultExportOptions;
  const fitExportOptions = fitExportNodes(nodes);
  const localFormat =
    format === ExportFormat.PNG_BG ? ExportFormat.PNG : format;
  const filenameWithExtension = `${fileName}.${localFormat.toLocaleLowerCase()}`;
  const downloadFn = format === ExportFormat.PDF ? downloadPdf : download;

  /**
   * For optimisation:
   * when the graph's `isExporting` is true the Chart's virtualisation will switch off
   * it causes all the nodes to be rendered however ReactFlow doesn't provide a declerative state for that:
   * [ref: https://github.com/xyflow/xyflow/blob/11.11.4/packages/core/src/hooks/useVisibleNodes.ts#L12] -- nodeInternals remain intact
   *
   * therefore we observe the node and wait for it to be settled instead
   */
  return observeDOMSettling(DOMNode, async () => {
    try {
      // Add class to node to remove unwanted styles from the export
      DOMNode?.classList.add(EXPORTING_CLASS);

      let dataUrl = await toImage(DOMNode, {
        ...baseExportOptions,
        ...fitExportOptions,
      });

      if (format === ExportFormat.SVG) {
        /*
         * Prepend the SVG data URL with an XML declaration specifying iso-8859-1 encoding
         * to ensure proper handling of special characters and accents in the SVG output.
         */
        dataUrl = dataUrl.replace(
          'data:image/svg+xml;charset=utf-8,',
          'data:image/svg+xml;charset=utf-8,%3C%3Fxml version="1.0" encoding="iso-8859-1"%3F%3E',
        );
      }

      DOMNode?.classList.remove(EXPORTING_CLASS);

      await downloadFn(dataUrl, filenameWithExtension);
      onFinish();
    } catch (error) {
      toaster.notify({
        variant: 'error',
        title: t('export.title'),
        description: t('export.description'),
        showCloseButton: true,
      });
      onFinish();
    }
  });
}

async function downloadPdf(dataUrl: string, fileName: string): Promise<void> {
  const { jsPDF } = await import('jspdf');

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
  });
  const img = new Image();

  img.src = dataUrl;
  img.onload = () => {
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = img.width;
    const imgHeight = img.height;

    // Scaling image width and height to pdf width and height
    let newWidth = pdfWidth;
    let newHeight = (pdfWidth / imgWidth) * imgHeight;

    if (newHeight > pdfHeight) {
      newWidth = (pdfHeight / imgHeight) * imgWidth;
      newHeight = pdfHeight;
    }

    // Centering the image
    const xOffset = (pdfWidth - newWidth) / 2;
    const yOffset = (pdfHeight - newHeight) / 2;

    pdf.addImage(img, xOffset, yOffset, newWidth, newHeight);
    pdf.save(fileName);
  };
}

function fitExportNodes<T extends BaseData>(
  nodes: Node<T>[],
): Pick<ExportOptions, 'width' | 'height' | 'style'> {
  const nodesBounds = getRectOfNodes(nodes);
  const { width, height } = nodesBounds;
  const widthPadding = width * EXPORT_PADDING;
  const heightPadding = height * EXPORT_PADDING;
  let imgWidth = width + widthPadding;
  let imgHeight = height + heightPadding;

  if (nodes.length === 1) {
    imgWidth = width + width * EXPORT_ONE_NODE_PADDING;
    imgHeight = height + height * EXPORT_ONE_NODE_PADDING;
  }

  const [x, y, zoom] = getTransformForBounds(
    nodesBounds,
    imgWidth,
    imgHeight,
    EXPORT_MIN_ZOOM,
    EXPORT_MAX_ZOOM,
    EXPORT_PADDING,
  );

  return {
    width: imgWidth,
    height: imgHeight,
    style: {
      width: `${imgWidth}px`,
      height: `${imgHeight}px`,
      transform: `translate(${x}px, ${y}px) scale(${zoom})`,
    },
  };
}
