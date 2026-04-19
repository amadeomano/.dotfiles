import { render, screen, waitFor } from '@testing-library/react';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';
import { Controls } from 'designSystem/component/control-bar';
import userEvent from '@testing-library/user-event';
import { mockOrgChartPreferencesProps } from '../../../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { type Source } from '../../../sources/preferences/types';
import { toTranslate } from '../../../toTranslate';
import { SourceSwitcher, SOURCE_SWITCHER_TEST_ID } from './SourceSwitcher';

jest.mock('@personio-web/use-feature-flag-wrapper');
jest.mock('@personio-web/employees-organizations-feature-org-units');
jest.spyOn(Controls, 'Primary');

const mockUseOrgUnitDetailsState = useOrgUnitDetailsState as jest.Mock;
const mockSetOrgUnitDetailsStateWithCallback = jest.fn();

const mockPreferences = {
  ...mockOrgChartPreferencesProps,
  source: 'Supervisor' as Source,
  setSource: jest.fn(),
  viewportState: { requestedState: null, requestNewState: jest.fn() },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <DialogProvider>
    <MockOrgChartPreferencesContext {...mockPreferences}>
      {children}
    </MockOrgChartPreferencesContext>
  </DialogProvider>
);

describe('SourceSwitcher', () => {
  const mockUseFeatureFlag = useFeatureFlag as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrgUnitDetailsState.mockReturnValue({
      state: null,
      setState: jest.fn(),
      setStateWithCallback: mockSetOrgUnitDetailsStateWithCallback,
      isDrawerFullyOpened: false,
    });
  });

  it('should not render when feature flag is disabled', () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: false,
      isReady: true,
    });

    const { container } = render(<SourceSwitcher />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it('should not render when feature flag is not ready', () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: true,
      isReady: false,
    });

    const { container } = render(<SourceSwitcher />, { wrapper: Wrapper });
    expect(container).toBeEmptyDOMElement();
  });

  it('should render with default source when feature flag is enabled', () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: true,
      isReady: true,
    });

    render(<SourceSwitcher />, { wrapper: Wrapper });
    const trigger = screen.getByRole('button', {
      name: toTranslate.orgChart.controlBar.sourceSwitcher.people,
    });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute('data-test-id', SOURCE_SWITCHER_TEST_ID);
  });

  it('should render all source options in dropdown', () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: true,
      isReady: true,
    });

    render(<SourceSwitcher />, { wrapper: Wrapper });

    const trigger = screen.getByRole('button', {
      name: toTranslate.orgChart.controlBar.sourceSwitcher.people,
    });
    expect(trigger).toBeInTheDocument();

    userEvent.click(trigger);

    expect(
      screen.getByRole('menuitem', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.people,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.departments,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.teams,
      }),
    ).toBeInTheDocument();
  });

  it('should change source when selecting a different option', async () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: true,
      isReady: true,
    });

    render(<SourceSwitcher />, { wrapper: Wrapper });

    userEvent.click(
      screen.getByRole('button', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.people,
      }),
    );
    userEvent.click(
      screen.getByRole('menuitem', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.departments,
      }),
    );

    await waitFor(() =>
      expect(mockPreferences.setSource).toHaveBeenCalledWith('Department'),
    );
    expect(mockPreferences.viewportState.requestNewState).toHaveBeenCalledWith({
      mode: 'resetViewport',
      animated: true,
    });
  });

  it('should call setOrgUnitDetailsStateWithCallback when org unit details state exists', async () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: true,
      isReady: true,
    });

    mockUseOrgUnitDetailsState.mockReturnValue({
      state: { orgUnitId: 123, orgUnitType: 'department' },
      setState: jest.fn(),
      setStateWithCallback: mockSetOrgUnitDetailsStateWithCallback,
      isDrawerFullyOpened: true,
    });

    mockSetOrgUnitDetailsStateWithCallback.mockImplementation(
      (_value, callback) => {
        callback();
      },
    );

    render(<SourceSwitcher />, { wrapper: Wrapper });

    userEvent.click(
      screen.getByRole('button', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.people,
      }),
    );
    userEvent.click(
      screen.getByRole('menuitem', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.teams,
      }),
    );

    await waitFor(() => {
      expect(mockSetOrgUnitDetailsStateWithCallback).toHaveBeenCalledWith(
        null,
        expect.any(Function),
      );
    });

    await waitFor(() =>
      expect(mockPreferences.setSource).toHaveBeenCalledWith('Team'),
    );
  });

  it('should execute callback immediately when no dialog or org unit state exists', async () => {
    mockUseFeatureFlag.mockReturnValue({
      isOn: true,
      isReady: true,
    });

    mockUseOrgUnitDetailsState.mockReturnValue({
      state: null,
      setState: jest.fn(),
      setStateWithCallback: mockSetOrgUnitDetailsStateWithCallback,
      isDrawerFullyOpened: false,
    });

    render(<SourceSwitcher />, { wrapper: Wrapper });

    userEvent.click(
      screen.getByRole('button', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.people,
      }),
    );
    userEvent.click(
      screen.getByRole('menuitem', {
        name: toTranslate.orgChart.controlBar.sourceSwitcher.teams,
      }),
    );

    await waitFor(() =>
      expect(mockPreferences.setSource).toHaveBeenCalledWith('Team'),
    );

    expect(mockSetOrgUnitDetailsStateWithCallback).not.toHaveBeenCalled();
  });
});
