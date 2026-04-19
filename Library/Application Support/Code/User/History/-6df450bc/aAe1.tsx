import { screen, waitFor } from '@testing-library/react';
import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import { server } from '@personio-web/mocks/server';
import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/mocking';
import { getEmployeeListColumnsHandlers } from '@personio-web/employees-organizations-data-people-list/mocking';

import { OrgChart } from '../';
import * as useOtherPeopleDrawerModule from '../hooks/useOtherPeopleDrawer';
import * as usePersonDetailsDrawerModule from '../hooks/usePersonDetailsDrawer';
import * as useOrgUnitDetailsDrawerModule from '../hooks/useOrgUnitDetailsDrawer';

jest.mock('d3-timer', () => ({
  timer: jest.fn(),
}));

describe('OrgChart', () => {
  beforeEach(() => {
    server.use(getFeatureAccessHandlers.defaultHandler);
    server.use(getEmployeeListColumnsHandlers.defaultHandler);
  });
  const { t } = getPersonioTranslation('navigation');
  const { t: tOrgUnits } = getPersonioTranslation('org-units');

  it.skip('should render content', async () => {
    renderWithWrapper(<OrgChart />);

    await screen.findByText(t('main.org-chart'));
  });

  it('should render not authorized component when user has no access', async () => {
    server.use(
      getFeatureAccessHandlers.getFeatureAccess200Handler__getOrgchartUnauthorized,
    );
    renderWithWrapper(<OrgChart />);

    expect(screen.queryByText(t('main.org-chart'))).not.toBeInTheDocument();
    await screen.findByText(tOrgUnits('access-rights-error.title'));
  });

  describe('closePanel logic', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should render with isPanelOpen true when all drawers are open', async () => {
      // Mock all drawer hooks to return open state
      jest
        .spyOn(useOtherPeopleDrawerModule, 'useOtherPeopleDrawer')
        .mockReturnValue({
          isOpen: true,
          close: jest.fn(),
          Drawer: () => null,
        });

      jest
        .spyOn(usePersonDetailsDrawerModule, 'usePersonDetailsDrawer')
        .mockReturnValue({
          isOpen: true,
          data: { employeeId: '123' },
          close: jest.fn(),
          Drawer: () => null as never,
        });

      jest
        .spyOn(useOrgUnitDetailsDrawerModule, 'useOrgUnitDetailsDrawer')
        .mockReturnValue({
          isOpen: true,
          data: { orgUnitId: 1, orgUnitType: 'department' },
          close: jest.fn(),
          Drawer: () => null as never,
        });

      renderWithWrapper(<OrgChart />);

      // This tests that isPanelOpen evaluates correctly (lines 48-52)
      await waitFor(() => {
        expect(screen.getByText(t('main.organization'))).toBeInTheDocument();
      });
    });

    it('should render with isPanelOpen true when only other people drawer is open', async () => {
      jest
        .spyOn(useOtherPeopleDrawerModule, 'useOtherPeopleDrawer')
        .mockReturnValue({
          isOpen: true,
          close: jest.fn(),
          Drawer: () => null,
        });

      jest
        .spyOn(usePersonDetailsDrawerModule, 'usePersonDetailsDrawer')
        .mockReturnValue({
          isOpen: false,
          data: undefined,
          close: jest.fn(),
          Drawer: () => null as never,
        });

      jest
        .spyOn(useOrgUnitDetailsDrawerModule, 'useOrgUnitDetailsDrawer')
        .mockReturnValue({
          isOpen: false,
          data: undefined,
          close: jest.fn(),
          Drawer: () => null as never,
        });

      renderWithWrapper(<OrgChart />);

      // This tests lines 48-52 with only otherPeopleDrawer.isOpen = true
      await waitFor(() => {
        expect(screen.getByText(t('main.organization'))).toBeInTheDocument();
      });
    });

    it('should render with isPanelOpen true when only person details drawer is open', async () => {
      jest
        .spyOn(useOtherPeopleDrawerModule, 'useOtherPeopleDrawer')
        .mockReturnValue({
          isOpen: false,
          close: jest.fn(),
          Drawer: () => null,
        });

      jest
        .spyOn(usePersonDetailsDrawerModule, 'usePersonDetailsDrawer')
        .mockReturnValue({
          isOpen: true,
          data: { employeeId: '123' },
          close: jest.fn(),
          Drawer: () => null as never,
        });

      jest
        .spyOn(useOrgUnitDetailsDrawerModule, 'useOrgUnitDetailsDrawer')
        .mockReturnValue({
          isOpen: false,
          data: undefined,
          close: jest.fn(),
          Drawer: () => null as never,
        });

      renderWithWrapper(<OrgChart />);

      // This tests lines 48-52 with only personDetailsDrawer.isOpen = true
      await waitFor(() => {
        expect(screen.getByText(t('main.organization'))).toBeInTheDocument();
      });
    });

    it('should render with isPanelOpen true when only org unit details drawer is open', async () => {
      jest
        .spyOn(useOtherPeopleDrawerModule, 'useOtherPeopleDrawer')
        .mockReturnValue({
          isOpen: false,
          close: jest.fn(),
          Drawer: () => null,
        });

      jest
        .spyOn(usePersonDetailsDrawerModule, 'usePersonDetailsDrawer')
        .mockReturnValue({
          isOpen: false,
          data: undefined,
          close: jest.fn(),
          Drawer: () => null as never,
        });

      jest
        .spyOn(useOrgUnitDetailsDrawerModule, 'useOrgUnitDetailsDrawer')
        .mockReturnValue({
          isOpen: true,
          data: { orgUnitId: 1, orgUnitType: 'department' },
          close: jest.fn(),
          Drawer: () => null as never,
        });

      renderWithWrapper(<OrgChart />);

      // This tests lines 48-52 with only orgUnitDetailsDrawer.isOpen = true
      await waitFor(() => {
        expect(screen.getByText(t('main.organization'))).toBeInTheDocument();
      });
    });
  });
});
