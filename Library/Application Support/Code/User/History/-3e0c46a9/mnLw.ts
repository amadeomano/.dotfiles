import download from 'downloadjs';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { type TFunction } from 'i18next';
import { getRectOfNodes, getTransformForBounds, type Node } from 'reactflow';

import { toaster } from 'designSystem/component/toaster';

import {
  EXPORT_FILENAME,
  EXPORT_MAX_ZOOM,
  EXPORT_MIN_ZOOM,
  EXPORT_PADDING,
  EXPORTING_CLASS,
  VIEWPORT_CLASS,
} from '../constants';
import { type BaseData, ExportFormat } from '../types';

type ExportOptions = NonNullable<Parameters<typeof toPng>[1]>;

const defaultExportOptions: ExportOptions = {
  cacheBust: true,
  fontEmbedCSS: '',
};

const formatExportOptions: Record<ExportFormat, ExportOptions> = {
  [ExportFormat.PNG]: defaultExportOptions,
  [ExportFormat.JPEG]: {
    ...defaultExportOptions,
    backgroundColor: '#ffffff',
  },
  [ExportFormat.SVG]: defaultExportOptions,
  [ExportFormat.PDF]: defaultExportOptions,
};

const toFormat = {
  [ExportFormat.PNG]: toPng,
  [ExportFormat.JPEG]: toJpeg,
  [ExportFormat.SVG]: toSvg,
  [ExportFormat.PDF]: toPng,
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
    let observer: MutationObserver;
    let settleTimeout: NodeJS.Timeout;
    let noChangeTimeout: NodeJS.Timeout;

    const callCallback = () => {};
    observer = new MutationObserver(() => {
      clearTimeout(settleTimeout);
      clearTimeout(noChangeTimeout);

      settleTimeout = setTimeout(() => {
        observer.disconnect();
        callback();
        resolve();
      }, settleTime);
    });

    observer.observe(targetNode, { childList: true, subtree: true });

    // For smaller charts probably no mutation will happen.
    // if no mutation in half a second happens, we consider it to be small chart
    noChangeTimeout = setTimeout(() => {
      observer.disconnect();
      callback();
      resolve();
    }, 500);
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
  const toImage = toFormat[format] || toPng;
  const baseExportOptions = formatExportOptions[format] || defaultExportOptions;
  const fitExportOptions = fitExportNodes(nodes);
  const filenameWithExtension = `${fileName}.${format.toLocaleLowerCase()}`;
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

  // For a single node, padding is added and the node is centralized.
  if (nodes.length === 1) {
    return {
      width: width + widthPadding,
      height: height + heightPadding,
      style: {
        width: `${width + widthPadding}px`,
        height: `${height + heightPadding}px`,
        transform: `translate(${widthPadding / 2}px, ${
          heightPadding / 2
        }px) scale(1)`,
      },
    };
  }
  // For multiple nodes, they are arranged correctly in the viewport.
  const [x, y, zoom] = getTransformForBounds(
    nodesBounds,
    width + widthPadding,
    height + heightPadding,
    EXPORT_MIN_ZOOM,
    EXPORT_MAX_ZOOM,
    EXPORT_PADDING,
  );

  return {
    width: width + widthPadding,
    height: height + heightPadding,
    style: {
      width: `${width + widthPadding}px`,
      height: `${height + heightPadding}px`,
      transform: `translate(${x}px, ${y}px) scale(${zoom})`,
    },
  };
}
