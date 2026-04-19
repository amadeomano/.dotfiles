import { type ContextType, type PropsWithChildren } from 'react';

import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useOnViewportChange, type Viewport } from 'reactflow';

import { useAuthContext } from '@personio-web/auth-context';
import { toaster } from 'designSystem/component/toaster';

import {
  getTranslation,
  mockOrgChartPreferencesProps,
} from '../../test-setup/testHelpers';
import { maxZoom, minZoom } from '../constants';
import * as Amp from '../constants/amplitude';
import {
  OrgChartPreferencesProvider,
  OrgChartDataSourceContext,
} from '../hooks';
import { ViewActionsBar } from './ViewActionsBar';

jest.mock('reactflow', () => ({
  useOnViewportChange: jest.fn(),
}));

const mockTrackAmplitudeEvent = jest.fn();
jest.mock('@personio-web/amplitude-provider', () => ({
  useAmplitude: () => ({
    track: mockTrackAmplitudeEvent,
  }),
}));

jest.mock('@personio-web/auth-context', () => ({
  useAuthContext: jest.fn(() => ({
    entityType: 'employee',
    employeeId: '0',
  })),
}));

const mockOpenDialog = jest.fn();
jest.mock(
  '@personio-web/employees-organizations-hook-use-dialog-context',
  () => ({
    useDialogContext: jest.fn(() => ({
      openDialog: mockOpenDialog,
    })),
  }),
);

jest.mock('../TreeLayout', () => ({
  useViewport: jest.fn(() => ({
    zoom: 1,
  })),
  useTreeLayout: jest.fn(() => ({
    zoomTo: jest.fn(),
    fitView: jest.fn(),
  })),
  useTreeLayoutApi: jest.fn(() => ({
    getState: () => ({
      nodeOrigin: [0, 0],
      width: 100,
      height: 100,
    }),
  })),
}));

const fitNodesMock = jest.fn();
const fitNodeBranchMock = jest.fn();
jest.mock('../hooks/useViewportActions', () => ({
  useViewportActions: jest.fn(() => ({
    fitNodes: fitNodesMock,
    fitNodeBranch: fitNodeBranchMock,
  })),
}));

type DataSource = ContextType<typeof OrgChartDataSourceContext>;
const Wrapper = (props: PropsWithChildren<Partial<DataSource>>) => {
  const hierarchy: NonNullable<DataSource>['displayableHierarchy'] = {
    rootNodes: [],
    nodes: [],
    getNode: jest.fn(),
  };
  const dataSource: Partial<DataSource> = {
    completeHierarchyData:
      props.completeHierarchyData ?? ({ hierarchy } as never),
    displayableHierarchy: props.displayableHierarchy ?? hierarchy,
    isFiltering: props.isFiltering ?? false,
    expansionState: props.expansionState ?? {
      expanded: [],
      setExpanded: jest.fn(),
      handleToggleExpand: jest.fn(),
    },
    activeNodesState:
      props.activeNodesState ?? ({ setActiveNodeIds: jest.fn() } as never),
  };
  return (
    <OrgChartPreferencesProvider {...mockOrgChartPreferencesProps}>
      <OrgChartDataSourceContext.Provider value={dataSource as DataSource}>
        {props.children}
      </OrgChartDataSourceContext.Provider>
    </OrgChartPreferencesProvider>
  );
};

describe('ViewActionsBar', () => {
  const defaultProps = {
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onFitToScreen: jest.fn(),
    onFocusOnMe: jest.fn(),
    onExpandAllCards: jest.fn(),
    onResetToHomeView: jest.fn(),
    metadata: { testId: 'view-actions-bar' },
  };

  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.view-actions-bar',
  });

  it('renders correctly', () => {
    let onChangeViewportHandler: undefined | ((viewport: Viewport) => void);
    (useOnViewportChange as jest.Mock).mockImplementation(
      ({ onChange }) => (onChangeViewportHandler = onChange),
    );

    const { getByRole, getAllByRole, getByTestId } = render(
      <ViewActionsBar {...defaultProps} />,
      { wrapper: Wrapper },
    );

    onChangeViewportHandler?.({ x: 0, y: 0, zoom: 1 });

    expect(getByRole('menubar')).toBeInTheDocument();
    expect(getByTestId('view-actions-bar')).toBeInTheDocument();
    expect(getByTestId('view-actions-bar-current-zoom').innerText).toBe('100%');
    expect(getAllByRole('button').length).toBe(6);
  });

  it('renders correctly on macOS', async () => {
    jest
      .spyOn(window.navigator, 'platform', 'get')
      .mockImplementation(() => 'MacIntel');

    const { getByTestId, findByRole } = render(
      <ViewActionsBar {...defaultProps} />,
      { wrapper: Wrapper },
    );

    userEvent.hover(getByTestId('view-actions-bar-zoom-out'));

    const tooltip = await findByRole('tooltip');

    expect(within(tooltip).getByText('⌃')).toBeInTheDocument();
    expect(within(tooltip).getByText('-')).toBeInTheDocument();
  });

  it('renders correctly on windows OS', async () => {
    jest
      .spyOn(window.navigator, 'platform', 'get')
      .mockImplementation(() => 'Win32');

    const { getByTestId, findByRole } = render(
      <ViewActionsBar {...defaultProps} />,
      { wrapper: Wrapper },
    );

    userEvent.hover(getByTestId('view-actions-bar-zoom-out'));

    const tooltip = await findByRole('tooltip');

    expect(within(tooltip).getByText('Ctrl')).toBeInTheDocument();
    expect(within(tooltip).getByText('-')).toBeInTheDocument();
  });

  it('calls the correct function on button click', () => {
    render(<ViewActionsBar {...defaultProps} />, {
      wrapper: Wrapper,
    });

    userEvent.click(
      screen.getByRole('button', { name: t('tooltip.zoom-out') }),
    );
    expect(defaultProps.onZoomOut).toHaveBeenCalled();

    userEvent.click(screen.getByRole('button', { name: t('tooltip.zoom-in') }));
    expect(defaultProps.onZoomIn).toHaveBeenCalled();

    userEvent.click(
      screen.getByRole('button', { name: t('tooltip.zoom-to-fit') }),
    );
    expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.FIT_TO_SCREEN);
  });

  describe('zooming', () => {
    it('disables zoom out button when at min zoom level', () => {
      let onChangeViewportHandler: undefined | ((viewport: Viewport) => void);
      (useOnViewportChange as jest.Mock).mockImplementation(
        ({ onChange }) => (onChangeViewportHandler = onChange),
      );

      const { getByRole } = render(<ViewActionsBar {...defaultProps} />, {
        wrapper: Wrapper,
      });

      act(() => onChangeViewportHandler?.({ x: 0, y: 0, zoom: minZoom }));

      expect(
        getByRole('button', { name: t('tooltip.zoom-out') }),
      ).toBeDisabled();
    });

    it('disables zoom in button when at max zoom level', () => {
      let onChangeViewportHandler: undefined | ((viewport: Viewport) => void);
      (useOnViewportChange as jest.Mock).mockImplementation(
        ({ onChange }) => (onChangeViewportHandler = onChange),
      );

      const { getByRole } = render(<ViewActionsBar {...defaultProps} />, {
        wrapper: Wrapper,
      });

      act(() => onChangeViewportHandler?.({ x: 0, y: 0, zoom: maxZoom }));

      expect(
        getByRole('button', { name: t('tooltip.zoom-in') }),
      ).toBeDisabled();
    });

    it('re-enables the buttons when changing zoom', async () => {
      let onChangeViewportHandler: undefined | ((viewport: Viewport) => void);
      (useOnViewportChange as jest.Mock).mockImplementation(
        ({ onChange }) => (onChangeViewportHandler = onChange),
      );

      const { getByRole } = render(<ViewActionsBar {...defaultProps} />, {
        wrapper: Wrapper,
      });

      act(() => onChangeViewportHandler?.({ x: 0, y: 0, zoom: maxZoom }));

      expect(
        getByRole('button', { name: t('tooltip.zoom-in') }),
      ).toBeDisabled();

      act(() => onChangeViewportHandler?.({ x: 0, y: 0, zoom: 1 }));

      expect(getByRole('button', { name: t('tooltip.zoom-in') })).toBeEnabled();
    });
  });

  describe('Focus on me', () => {
    it('should show an error if authenticated person is invalid', () => {
      (useAuthContext as jest.Mock).mockImplementationOnce(() => ({
        entityType: 'unknown',
        employeeId: undefined,
      }));

      const toasterSpy = jest.spyOn(toaster, 'notify');
      render(<ViewActionsBar {...defaultProps} />, { wrapper: Wrapper });
      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.focus-on-me') }),
      );

      expect(toasterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'error',
        }),
      );
    });

    it('should open a dialog if the person is filtered out', () => {
      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <Wrapper displayableHierarchy={{ getNode: () => undefined } as never}>
          {children}
        </Wrapper>
      );

      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });
      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.focus-on-me') }),
      );
      expect(mockOpenDialog).toHaveBeenCalledWith('org-chart.remove-filters', {
        employeeId: '0',
      });
    });

    it('should set the selected employee and move the viewport to them', () => {
      const node = {};
      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <Wrapper displayableHierarchy={{ getNode: () => node } as never}>
          {children}
        </Wrapper>
      );

      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });
      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.focus-on-me') }),
      );

      expect(
        mockOrgChartPreferencesProps.setFocusedEmployeeId,
      ).toHaveBeenCalledWith('0');
      expect(fitNodeBranchMock).toHaveBeenCalledWith(node);
      expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.FOCUSED_ON_ME);
    });
  });

  describe('Reset to home view', () => {
    it('should reset the filters and spotlight if any', () => {
      mockOrgChartPreferencesProps.filters = [{} as never];
      mockOrgChartPreferencesProps.spotlight = '0';

      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <Wrapper isFiltering>{children}</Wrapper>
      );
      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });

      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.reset-to-home-view') }),
      );

      expect(mockOrgChartPreferencesProps.setFilters).toHaveBeenCalledWith([]);
      expect(mockOrgChartPreferencesProps.setSpotlight).toHaveBeenCalledWith(
        '',
      );
    });

    it('should collapse all nodes expect root nodes', () => {
      const sub11 = { id: 'sub-1-1' };
      const sub12 = { id: 'sub-1-2' };
      const sub1 = { id: 'sub-1', children: [sub11, sub12] };
      const sub2 = { id: 'sub-2' };
      const root1 = { id: 'root-1', children: [sub1] };
      const root2 = { id: 'root-2', children: [sub2] };

      const rootNodes = [root1, root2];
      const expanded = ['root-1', 'root-2', 'sub-1', 'sub-2'];

      const setExpandedMock = jest.fn();
      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <Wrapper
          completeHierarchyData={{ hierarchy: { rootNodes } } as never}
          expansionState={{ expanded, setExpanded: setExpandedMock } as never}
        >
          {children}
        </Wrapper>
      );
      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });

      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.reset-to-home-view') }),
      );
      expect(setExpandedMock).toHaveBeenCalledWith(['root-1', 'root-2']);
    });

    it('should unset active node and move viewport to cover both root and its children', () => {
      const sub11 = { id: 'sub-1-1' };
      const sub12 = { id: 'sub-1-2' };
      const sub1 = { id: 'sub-1', children: [sub11, sub12] };
      const sub2 = { id: 'sub-2' };
      const root1 = { id: 'root-1', children: [sub1] };
      const root2 = { id: 'root-2', children: [sub2] };

      const rootNodes = [root1, root2];

      const setActiveNodeIds = jest.fn();
      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <Wrapper
          completeHierarchyData={{ hierarchy: { rootNodes } } as never}
          activeNodesState={{ setActiveNodeIds } as never}
        >
          {children}
        </Wrapper>
      );
      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });

      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.reset-to-home-view') }),
      );

      expect(
        mockOrgChartPreferencesProps.setFocusedEmployeeId,
      ).toHaveBeenCalledWith(null);
      expect(setActiveNodeIds).toHaveBeenCalledWith([]);
      expect(fitNodesMock).toHaveBeenCalledWith(
        ['root-1', 'root-2', 'sub-1', 'sub-2'],
        { waitForUpdatedPosition: true },
      );
    });
  });

  it('should expand all nodes and fit them to screen', () => {
    const sub11 = { id: 'sub-1-1' };
    const sub12 = { id: 'sub-1-2' };
    const sub1 = { id: 'sub-1', children: [sub11, sub12] };
    const sub2 = { id: 'sub-2' };
    const root1 = { id: 'root-1', children: [sub1] };
    const root2 = { id: 'root-2', children: [sub2] };

    const rootNodes = [root1, root2];
    const expanded = ['root-1', 'root-2', 'sub-1', 'sub-2'];

    const setExpandedMock = jest.fn();
    const FilterdWrapper = ({ children }: PropsWithChildren) => (
      <Wrapper
        completeHierarchyData={{ hierarchy: { rootNodes } } as never}
        expansionState={{ expanded, setExpanded: setExpandedMock } as never}
      >
        {children}
      </Wrapper>
    );
    render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });

    userEvent.click(
      screen.getByRole('button', { name: t('tooltip.reset-to-home-view') }),
    );
    userEvent.click(
      screen.getByRole('button', { name: t('tooltip.expand-all-cards') }),
    );
    expect(setExpandedMock).toHaveBeenCalledWith(['root-1', 'root-2']);
  });
});
