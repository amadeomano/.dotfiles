import { screen, fireEvent, waitFor } from '@testing-library/react';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';

import {
  getTranslation,
  renderWithWrapper,
} from '../../../../test-setup/testHelpers';
import { MockOrgChartPreferencesContext } from '../../../../test-setup/mocks/MockOrgChartPreferencesContext';
import { MockOrgChartUIContext } from '../../../../test-setup/mocks/MockOrgChartUIContext';
import { useGetCurrentUserData } from '../../../hooks';
import SavedViewsMenu from './SavedViewsMenu';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useGetCurrentUserData: jest.fn(),
}));

jest.mock('@personio-web/use-feature-flag-wrapper');
jest.mock('@personio-web/employees-organizations-feature-org-units');

const mockUseFeatureFlag = useFeatureFlag as jest.Mock;
const mockUseOrgUnitDetailsState = useOrgUnitDetailsState as jest.Mock;
const mockSetOrgUnitDetailsStateWithCallback = jest.fn();

const { t } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.control-bar',
});

const { t: tSourceSwitcher } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.control-bar.source-switcher',
});

const { t: tSavedViews } = getTranslation('employees-organizations', {
  keyPrefix: 'org-chart.control-bar.saved-views',
});

describe('SavedViewsMenu', () => {
  beforeAll(() => {
    mockUseFeatureFlag.mockReturnValue({ isOn: true, isReady: true });
    (useGetCurrentUserData as jest.Mock).mockReturnValue({
      id: 'user1',
      department: true,
      team: true,
      office: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrgUnitDetailsState.mockReturnValue({
      state: null,
      setState: jest.fn(),
      setStateWithCallback: mockSetOrgUnitDetailsStateWithCallback,
      isDrawerFullyOpened: false,
    });
  });

  it('renders SupervisorSavedViews component', () => {
    renderWithWrapper(
      <MockOrgChartPreferencesContext>
        <MockOrgChartUIContext>
          <SavedViewsMenu />
        </MockOrgChartUIContext>
      </MockOrgChartPreferencesContext>,
    );

    expect(screen.getByText(t('views.default.title'))).toBeInTheDocument();
  });

  it('renders source options menu items', () => {
    renderWithWrapper(
      <MockOrgChartPreferencesContext>
        <MockOrgChartUIContext>
          <SavedViewsMenu />
        </MockOrgChartUIContext>
      </MockOrgChartPreferencesContext>,
    );

    expect(screen.getByText(tSourceSwitcher('people'))).toBeInTheDocument();
    expect(
      screen.getByText(tSourceSwitcher('departments')),
    ).toBeInTheDocument();
    expect(screen.getByText(tSourceSwitcher('teams'))).toBeInTheDocument();
  });

  it('handles source option click', async () => {
    const setSource = jest.fn();

    renderWithWrapper(
      <DialogProvider>
        <MockOrgChartPreferencesContext setSource={setSource}>
          <MockOrgChartUIContext>
            <SavedViewsMenu />
          </MockOrgChartUIContext>
        </MockOrgChartPreferencesContext>
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText(tSourceSwitcher('departments')));

    await waitFor(() => expect(setSource).toHaveBeenCalledWith('Department'));
  });

  it('renders menu header with arrange by section text', () => {
    renderWithWrapper(
      <MockOrgChartPreferencesContext>
        <MockOrgChartUIContext>
          <SavedViewsMenu />
        </MockOrgChartUIContext>
      </MockOrgChartPreferencesContext>,
    );

    expect(
      screen.getByText(tSavedViews('arrange-by-section')),
    ).toBeInTheDocument();
  });

  it('should call setOrgUnitDetailsStateWithCallback when org unit details state exists', async () => {
    const setSource = jest.fn();

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

    renderWithWrapper(
      <DialogProvider>
        <MockOrgChartPreferencesContext setSource={setSource}>
          <MockOrgChartUIContext>
            <SavedViewsMenu />
          </MockOrgChartUIContext>
        </MockOrgChartPreferencesContext>
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText(tSourceSwitcher('teams')));

    await waitFor(() => {
      expect(mockSetOrgUnitDetailsStateWithCallback).toHaveBeenCalledWith(
        null,
        expect.any(Function),
      );
    });

    await waitFor(() => expect(setSource).toHaveBeenCalledWith('Team'));
  });

  it('should execute callback immediately when no dialog or org unit state exists', async () => {
    const setSource = jest.fn();

    mockUseOrgUnitDetailsState.mockReturnValue({
      state: null,
      setState: jest.fn(),
      setStateWithCallback: mockSetOrgUnitDetailsStateWithCallback,
      isDrawerFullyOpened: false,
    });

    renderWithWrapper(
      <DialogProvider>
        <MockOrgChartPreferencesContext setSource={setSource}>
          <MockOrgChartUIContext>
            <SavedViewsMenu />
          </MockOrgChartUIContext>
        </MockOrgChartPreferencesContext>
      </DialogProvider>,
    );

    fireEvent.click(screen.getByText(tSourceSwitcher('teams')));

    await waitFor(() => expect(setSource).toHaveBeenCalledWith('Team'));

    expect(mockSetOrgUnitDetailsStateWithCallback).not.toHaveBeenCalled();
  });
});
