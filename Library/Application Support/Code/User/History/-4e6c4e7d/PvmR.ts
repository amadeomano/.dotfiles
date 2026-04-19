import { waitFor } from '@testing-library/react';
import download from 'downloadjs';
import { toJpeg, toPng, toSvg } from 'html-to-image';
import { type TFunction } from 'i18next';
import { jsPDF } from 'jspdf';

import { toaster } from 'designSystem/component/toaster';

import { EXPORT_FILENAME, EXPORT_PADDING } from '../constants';
import { type BaseData, ExportFormat, type TreeNode } from '../types';
import { exportNodes } from './exportNodes';

const mockWidth = 100;
const mockHeight = 100;
const mockPadding = 100 * EXPORT_PADDING;
const mockImageWidth = mockWidth + mockPadding;
const mockImageHeight = mockHeight + mockPadding;
const mockPng = 'data:image/png;base64,mockdata';
const mockJpeg = 'data:image/jpeg;base64,mockdata';
const mockSvg = 'data:image/svg+xml;base64,mockdata';

const addImageMock = jest.fn();
const saveMock = jest.fn();
jest.mock('downloadjs');
jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    internal: {
      pageSize: {
        getWidth: jest.fn().mockReturnValue(210), // Mock PDF width
        getHeight: jest.fn().mockReturnValue(297), // Mock PDF height
      },
    },
    addImage: addImageMock,
    save: saveMock,
  })),
}));

jest.mock('designSystem/component/toaster');
jest.mock('html-to-image', () => ({
  ...jest.requireActual('html-to-image'),
  toPng: jest.fn().mockImplementation(() => Promise.resolve(mockPng)),
  toJpeg: jest.fn().mockImplementation(() => Promise.resolve(mockJpeg)),
  toSvg: jest.fn().mockImplementation(() => Promise.resolve(mockSvg)),
}));
jest.mock('reactflow', () => ({
  ...jest.requireActual('reactflow'),
  getRectOfNodes: jest.fn().mockImplementation(() => ({
    x: 0,
    y: 0,
    width: mockWidth,
    height: mockHeight,
  })),
  getTransformForBounds: jest.fn().mockReturnValue([0, 0, 1]),
}));

const mockQuerySelector = jest.fn();
jest.spyOn(document, 'querySelector').mockImplementation(mockQuerySelector);
const t = jest.fn((key) => key) as unknown as TFunction<
  'employees-organizations',
  'org-chart.errors'
>;

const mockNodes = [
  { id: '1', parent: null, data: {}, position: { x: 0, y: 0 } },
  { id: '2', parent: null, data: {}, position: { x: 100, y: 100 } },
] as TreeNode<BaseData>[];

describe('exportNodes', () => {
  const mockDOMNode = document.createElement('div');

  it('should export single node as PNG', async () => {
    const onFinish = jest.fn();
    await exportNodes({
      format: ExportFormat.PNG,
      nodes: [mockNodes[0]],
      onFinish,
      DOMNode: mockDOMNode,
      t,
    });

    const mockTranslate = mockPadding / 2;
    expect(toPng).toHaveBeenCalledWith(
      mockDOMNode,
      expect.objectContaining({
        width: mockImageWidth,
        height: mockImageHeight,
        style: {
          width: `${mockImageWidth}px`,
          height: `${mockImageHeight}px`,
          transform: `translate(${mockTranslate}px, ${mockTranslate}px) scale(1)`,
        },
      }),
    );
    expect(download).toHaveBeenCalledWith(
      'data:image/png;base64,mockdata',
      `${EXPORT_FILENAME}.png`,
    );
    expect(onFinish).toHaveBeenCalled();
  });

  it('should export multiple nodes as PNG', async () => {
    const onFinish = jest.fn();
    mockQuerySelector.mockReturnValue(mockDOMNode);
    await exportNodes({
      format: ExportFormat.PNG,
      nodes: mockNodes,
      onFinish,
      t,
    });

    expect(toPng).toHaveBeenCalledWith(
      mockDOMNode,
      expect.objectContaining({
        width: 125,
        height: 125,
        style: {
          width: '125px',
          height: '125px',
          transform: 'translate(0px, 0px) scale(1)',
        },
      }),
    );
    expect(download).toHaveBeenCalledWith(
      'data:image/png;base64,mockdata',
      `${EXPORT_FILENAME}.png`,
    );
    expect(onFinish).toHaveBeenCalled();
  });

  it('should export nodes as JPEG', async () => {
    const onFinish = jest.fn();
    mockQuerySelector.mockReturnValue(mockDOMNode);

    await exportNodes({
      format: ExportFormat.JPEG,
      nodes: mockNodes,
      onFinish,
      t,
    });

    expect(toJpeg).toHaveBeenCalledWith(mockDOMNode, expect.any(Object));
    expect(download).toHaveBeenCalledWith(mockJpeg, `${EXPORT_FILENAME}.jpeg`);
    expect(onFinish).toHaveBeenCalled();
  });

  it('should export nodes as SVG', async () => {
    const onFinish = jest.fn();
    mockQuerySelector.mockReturnValue(mockDOMNode);

    await exportNodes({
      format: ExportFormat.SVG,
      nodes: mockNodes,
      onFinish,
      t,
    });

    expect(toSvg).toHaveBeenCalledWith(mockDOMNode, expect.any(Object));
    expect(download).toHaveBeenCalledWith(mockSvg, `${EXPORT_FILENAME}.svg`);
    expect(onFinish).toHaveBeenCalled();
  });

  it('should export nodes as PDF', async () => {
    const onFinish = jest.fn();
    const mockImage = {
      width: 1000,
      height: 1000,
      onload: jest.fn(),
      src: '',
    };

    global.Image = jest.fn(() => mockImage as unknown as HTMLImageElement);

    mockQuerySelector.mockReturnValue(mockDOMNode);

    await exportNodes({
      format: ExportFormat.PDF,
      nodes: mockNodes,
      onFinish,
      t,
    });

    mockImage.onload();

    expect(toPng).toHaveBeenCalledWith(mockDOMNode, expect.any(Object));
    await waitFor(() =>
      expect(jsPDF).toHaveBeenCalledWith({
        orientation: 'landscape',
        unit: 'px',
      }),
    );

    await waitFor(() =>
      expect(addImageMock).toHaveBeenCalledWith(
        mockImage,
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
        expect.any(Number),
      ),
    );
    expect(saveMock).toHaveBeenCalledWith(`${EXPORT_FILENAME}.pdf`);
    expect(onFinish).toHaveBeenCalled();
  });

  it('should notify error if export fails', async () => {
    const onFinish = jest.fn();
    mockQuerySelector.mockReturnValue(mockDOMNode);
    (toPng as jest.Mock).mockRejectedValue(new Error('Export failed'));

    await exportNodes({ format: ExportFormat.PNG, nodes: mockNodes, t });

    expect(toaster.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
      }),
    );
  });
});
