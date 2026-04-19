import { type PropsWithChildren } from 'react';

import * as reactFlow from 'reactflow';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuthContext } from '@personio-web/auth-context';
import { toaster } from 'designSystem/component/toaster';

import { getTranslation } from '../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartDataSourceContext } from '../../test-setup/mocks/MockOrgChartDataSourceContext';
import * as Amp from '../constants/amplitude';
import { type MultiSettablePrefs } from '../contexts';
import { MockOrgChartUIContext } from '../../test-setup/mocks/MockOrgChartUIContext';
import { ViewActionsBar } from './ViewActionsBar';

const useOnViewportChange = jest.spyOn(reactFlow, 'useOnViewportChange');

// jest.mock('reactflow', () => ({
//   ...jest.requireActual('reactflow'),
//   useOnViewportChange: jest.fn(),
//   useReactFlow: jest.fn(() => ({
//     zoomTo: jest.fn(),
//   })),
// }));

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
      isDialogOfType: () => jest.fn(),
    })),
  }),
);

jest.mock('../TreeLayout', () => ({
  useViewport: jest.fn(() => ({
    zoom: 1,
  })),
  useTreeLayout: jest.fn(() => ({
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

jest.mock('../hooks/useHasInclusionsAccess', () => ({
  useHasInclusionsAccess: jest.fn(() => true),
}));

const Wrapper = ({ children }: PropsWithChildren) => (
  <reactFlow.ReactFlowProvider>
    <MockOrgChartPreferencesContext>
      <MockOrgChartUIContext>
        <MockOrgChartDataSourceContext>
          {children}
        </MockOrgChartDataSourceContext>
      </MockOrgChartUIContext>
    </MockOrgChartPreferencesContext>
  </reactFlow.ReactFlowProvider>
);

describe('ViewActionsBar', () => {
  const defaultProps = {
    metadata: { testId: 'view-actions-bar' },
  };

  const { t } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.view-actions-bar',
  });
  const { t: tErrors } = getTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
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
      screen.getByRole('button', { name: t('tooltip.zoom-to-fit') }),
    );
    expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.FIT_TO_SCREEN, {
      org_chart_source: 'Supervisor',
    });
  });

  describe('Focus on me', () => {
    it('should show an error if authenticated person is invalid', () => {
      (useAuthContext as jest.Mock).mockImplementationOnce(() => ({
        entityType: 'unknown',
        employeeId: undefined,
      }));

      const toasterSpy = jest.spyOn(toaster, 'notify');
      render(<ViewActionsBar {...defaultProps} />, {
        wrapper: Wrapper,
      });
      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.focus-on-me') }),
      );

      expect(toasterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: tErrors('node.title'),
          description: tErrors('node.description'),
          variant: 'error',
        }),
      );
    });

    it('should show an error if the person is in the hidden list', () => {
      const hiddenRootIds = ['0'];
      const HiddenWrapper = ({ children }: PropsWithChildren) => (
        <reactFlow.ReactFlowProvider>
          <MockOrgChartPreferencesContext>
            <MockOrgChartDataSourceContext
              completeHierarchyData={{ data: { hiddenRootIds } } as never}
            >
              <MockOrgChartUIContext>{children}</MockOrgChartUIContext>
            </MockOrgChartDataSourceContext>
          </MockOrgChartPreferencesContext>
        </reactFlow.ReactFlowProvider>
      );

      const toasterSpy = jest.spyOn(toaster, 'notify');
      render(<ViewActionsBar {...defaultProps} />, { wrapper: HiddenWrapper });
      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.focus-on-me') }),
      );

      expect(toasterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: tErrors('employee-in-hidden-list.title'),
          description: tErrors('employee-in-hidden-list.description'),
          variant: 'error',
        }),
      );
    });

    it('should open a dialog if the person is filtered out', () => {
      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <reactFlow.ReactFlowProvider>
          <MockOrgChartPreferencesContext>
            <MockOrgChartDataSourceContext
              displayableHierarchy={{ getNode: () => undefined } as never}
            >
              <MockOrgChartUIContext>{children}</MockOrgChartUIContext>
            </MockOrgChartDataSourceContext>
          </MockOrgChartPreferencesContext>
        </reactFlow.ReactFlowProvider>
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
      const node = { ancestors: [] };
      const requestNewState = jest.fn();
      const setMultiplePrefsMock = jest.fn();
      const getInitialExpandedIdsMock = jest
        .fn()
        .mockReturnValue(['employee-me', 'employee-me-parent']);

      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <reactFlow.ReactFlowProvider>
          <MockOrgChartPreferencesContext
            setMultiplePrefs={setMultiplePrefsMock}
            viewportState={{ requestedState: null, requestNewState }}
          >
            <MockOrgChartDataSourceContext
              displayableHierarchy={{ getNode: () => node } as never}
              getInitialExpandedIds={getInitialExpandedIdsMock}
            >
              <MockOrgChartUIContext>{children}</MockOrgChartUIContext>
            </MockOrgChartDataSourceContext>
          </MockOrgChartPreferencesContext>
        </reactFlow.ReactFlowProvider>
      );

      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });
      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.focus-on-me') }),
      );

      expect(getInitialExpandedIdsMock).toHaveBeenCalledWith({
        activeCardId: '0',
      });
      expect(setMultiplePrefsMock).toHaveBeenCalledWith({
        activeAncestorIds: [],
        activeCardId: '0',
        expansionState: ['employee-me', 'employee-me-parent'],
      });
      expect(requestNewState).toHaveBeenCalledWith({
        mode: 'fitNode',
        nodeId: '0',
        includeChildrenAndParent: true,
        animated: true,
      });
      expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.FOCUSED_ON_ME, {
        org_chart_source: 'Supervisor',
      });
    });
  });

  describe('Reset to home view', () => {
    it('should reset active card id, filters, spotlight and expansion state', () => {
      const setMultiplePrefsMock = jest.fn();
      const getInitialExpandedIdsMock = jest
        .fn()
        .mockReturnValue(['root-1', 'root-2']);

      const FilterdWrapper = ({ children }: PropsWithChildren) => (
        <MockOrgChartPreferencesContext setMultiplePrefs={setMultiplePrefsMock}>
          <MockOrgChartDataSourceContext
            getInitialExpandedIds={getInitialExpandedIdsMock}
          >
            <MockOrgChartUIContext>{children}</MockOrgChartUIContext>
          </MockOrgChartDataSourceContext>
        </MockOrgChartPreferencesContext>
      );
      render(<ViewActionsBar {...defaultProps} />, { wrapper: FilterdWrapper });

      userEvent.click(
        screen.getByRole('button', { name: t('tooltip.reset-to-home-view') }),
      );

      const newPrefs: MultiSettablePrefs = {
        activeAncestorIds: [],
        activeCardId: null,
        filters: [],
        spotlight: '',
      };
      expect(getInitialExpandedIdsMock).toHaveBeenCalledWith(newPrefs);
      expect(setMultiplePrefsMock).toHaveBeenCalledWith({
        ...newPrefs,
        expansionState: ['root-1', 'root-2'],
      });
    });
  });

  it('should expand all nodes and fit them to screen', () => {
    const sub1 = { id: 'sub-1', childrenCount: 2 };
    const sub2 = { id: 'sub-2' };
    const root1 = { id: 'root-1', childrenCount: 1 };
    const root2 = { id: 'root-2', childrenCount: 1 };

    const nodes = [root1, root2, sub1, sub2];

    const setExpandedMock = jest.fn();
    const requestNewState = jest.fn();
    const LocalWrapper = ({ children }: PropsWithChildren) => (
      <MockOrgChartPreferencesContext
        expansionState={{ setExpanded: setExpandedMock } as never}
        viewportState={{ requestedState: null, requestNewState }}
      >
        <MockOrgChartDataSourceContext
          displayableHierarchy={{ nodes } as never}
        >
          <MockOrgChartUIContext>{children}</MockOrgChartUIContext>
        </MockOrgChartDataSourceContext>
      </MockOrgChartPreferencesContext>
    );
    render(<ViewActionsBar {...defaultProps} />, { wrapper: LocalWrapper });

    userEvent.click(
      screen.getByRole('button', { name: t('tooltip.expand-all-cards') }),
    );
    expect(setExpandedMock).toHaveBeenCalledWith(['root-1', 'root-2', 'sub-1']);
    expect(requestNewState).toHaveBeenCalledWith({
      mode: 'resetViewport',
      animated: true,
    });
    expect(mockTrackAmplitudeEvent).toHaveBeenCalledWith(Amp.EXPANDED_ALL, {
      org_chart_source: 'Supervisor',
    });
  });
});
