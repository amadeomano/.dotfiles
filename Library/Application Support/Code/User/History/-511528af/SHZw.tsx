/* eslint-disable jest/no-disabled-tests */
import { type ReactElement } from 'react';

import { getPersonioTranslation } from '@personio-web/config-jest/src/helpers';
import {
  GetOrgUnitHandlers,
  ListOrgUnitsHandlers,
} from '@personio-web/employees-organizations-gofer/mocking';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { server } from '@personio-web/mocks/server';
import { renderWithWrapper as renderWithWrapperBase } from '@personio-web/orchestrator-common/test-utils';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TestIds } from '../utils/test-ids';
import { type DrawerConfig } from './types';
import { OrgUnitDetails } from '.';

const loadingTestId = 'org-unit-details-loading-drawer';

const basePath = 'organization/org-units';

// TODO move instrumentation to a test setup file. Expose required types for options
const renderWithWrapper = (
  component: ReactElement,
  options?: any, //eslint-disable-line
): void => {
  renderWithWrapperBase(<DialogProvider>{component}</DialogProvider>, options);
};

const createDrawerConfig = (overrides?: Partial<DrawerConfig>) => ({
  showParentOrgUnit: overrides?.showParentOrgUnit ?? true,
  showSubOrgUnits: overrides?.showSubOrgUnits ?? true,
  onCloseClick: overrides?.onCloseClick || jest.fn(),
  onEditClick: overrides?.onEditClick,
  onDeleteClick: overrides?.onDeleteClick,
});

describe('OrgUnitDetails', () => {
  // TODO OS-1341 re-enable it when we replace useListOrgUnits with useGetOrgUnit
  describe.skip('OrgUnitDetails - useGetOrgUnit', () => {
    const { t } = getPersonioTranslation('org-units');

    it('renders department details', async () => {
      server.use(GetOrgUnitHandlers.defaultDepartmentHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByRole('heading', {
          name: 'Marketing Department',
        }),
      ).toBeInTheDocument();

      const propertyListItems = screen.getAllByRole('listitem');
      const parentItem = within(propertyListItems[0]);
      expect(parentItem.getByText('Parent department')).toBeInTheDocument();
      expect(parentItem.getByText('-')).toBeInTheDocument();

      const aboutItem = within(propertyListItems[1]);
      expect(aboutItem.getByText('About')).toBeInTheDocument();
      expect(
        aboutItem.getByText('Responsible for promoting products and services'),
      ).toBeInTheDocument();

      const resourceItem = within(propertyListItems[2]);
      expect(resourceItem.getByText('Resource')).toBeInTheDocument();
      expect(
        resourceItem.getByText('https://example.com/resource/1'),
      ).toBeInTheDocument();

      const codeItem = within(propertyListItems[3]);
      expect(codeItem.getByText('Code')).toBeInTheDocument();
      expect(codeItem.getByText('MKT')).toBeInTheDocument();
    });

    it('renders team details', async () => {
      server.use(GetOrgUnitHandlers.defaultTeamHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={159}
          type="team"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      await expect(
        screen.findByText('Parent team'),
      ).resolves.toBeInTheDocument();
      expect(screen.getByText('2 Sub-teams')).toBeInTheDocument();
    });

    it('renders parent token', async () => {
      server.use(GetOrgUnitHandlers.withParentIdHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      const propertyListItems = screen.getAllByRole('listitem');
      const parentItem = within(propertyListItems[0]);
      expect(parentItem.getByText('Parent department')).toBeInTheDocument();
      expect(
        parentItem.getByRole('link', {
          name: 'Quality Assurance Department 2',
        }),
      ).toHaveAttribute('href', `${basePath}/departments/details/20`);
    });

    it('renders members count and correct link to people list', async () => {
      server.use(GetOrgUnitHandlers.defaultDepartmentHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(screen.getByText('59 members')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: t('details.people-list-link') }),
      ).toHaveAttribute(
        'href',
        `/staff?extra=${encodeURIComponent(
          JSON.stringify({
            filters: { department_id: ['1'] },
            columns: ['department_id'],
          }),
        )}`,
      );
    });

    it('renders descendants count and tokens', async () => {
      server.use(GetOrgUnitHandlers.withParentIdHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      const subDepartmentsProp = await screen.findByRole('listitem', {
        name: 'Sub-departments',
      });
      expect(
        within(subDepartmentsProp).getByText('4 Sub-departments'),
      ).toHaveAttribute('href', `${basePath}/departments/details/62`);
      expect(
        screen.getByRole('link', { name: 'Sales Department 5' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/79`);
      expect(
        screen.getByRole('link', { name: 'R&D Department 14' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/189`);
      expect(
        screen.getByRole('link', { name: 'Marketing Department 14' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/231`);
    });

    it('renders loading state', () => {
      server.use(GetOrgUnitHandlers.defaultDepartmentHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );
      expect(
        screen.getByTestId('org-unit-details-loading-drawer'),
      ).toBeInTheDocument();
    });

    it('should navigate to edit mode when "edit" button is clicked', async () => {
      server.use(GetOrgUnitHandlers.defaultDepartmentHandler);

      const mockOnEditClick = jest.fn();
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig({ onEditClick: mockOnEditClick })}
        />,
        {
          router: {
            pathname: `${basePath}/departments/details/1`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      userEvent.click(
        screen.getByRole('button', {
          name: 'Edit',
        }),
      );

      expect(mockOnEditClick).toHaveBeenCalled();
    });

    it('renders error message and navigates away when "Close" is clicked', async () => {
      server.use(GetOrgUnitHandlers.httpErrorHandler);

      const mockOnCloseClick = jest.fn();
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig({ onCloseClick: mockOnCloseClick })}
        />,
        {
          router: {
            pathname: `${basePath}/departments/details/1`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(screen.getByText(t('error-state.title'))).toBeInTheDocument();
      expect(
        screen.getByText(t('error-state.description')),
      ).toBeInTheDocument();

      userEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnCloseClick).toHaveBeenCalled();
    });

    it('renders not found view when the org unit does not exist anymore', async () => {
      server.use(GetOrgUnitHandlers.notFoundHandler);

      renderWithWrapper(
        <OrgUnitDetails
          id={10000}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
        {
          router: {
            pathname: `${basePath}/departments/details/10000`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByText(t('details.not-found-department-title')),
      ).toBeInTheDocument();
      expect(
        screen.getByText(t('details.not-found-department-description')),
      ).toBeInTheDocument();
    });

    it('clicks on the link and checks for the external link dialog', async () => {
      server.use(GetOrgUnitHandlers.defaultDepartmentHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByRole('heading', {
          name: 'Marketing Department',
        }),
      ).toBeInTheDocument();

      const propertyListItems = screen.getAllByRole('listitem');
      const resourceItem = within(propertyListItems[1]);

      expect(resourceItem.getByText('Resource')).toBeInTheDocument();

      userEvent.click(resourceItem.getByText('https://example.com/resource/1'));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', {
            name: t('table.external-link.dialog.title'),
          }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(t('table.external-link.dialog.title')),
      ).toBeInTheDocument();

      expect(
        within(screen.getByRole('dialog')).getByText(
          'https://example.com/resource/1',
        ),
      ).toBeInTheDocument();
    });

    it('clicks on the link and checks for internal redirect', async () => {
      server.use(GetOrgUnitHandlers.defaultTeamHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={4}
          type="team"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByRole('heading', {
          name: 'Operations Team',
        }),
      ).toBeInTheDocument();

      const propertyListItems = screen.getAllByRole('listitem');
      const resourceItem = within(propertyListItems[1]);

      expect(resourceItem.getByText('Resource')).toBeInTheDocument();

      userEvent.click(
        resourceItem.getByText('https://personio.personio.com/resource/4'),
      );

      expect(
        screen.queryByRole('dialog', {
          name: t('table.external-link.dialog.title'),
        }),
      ).not.toBeInTheDocument();
    });
  });

  // TODO OS-1341 delete OrgUnitDetails - useListOrgUnits tests when all is migrated to useGetOrgUnit
  describe('OrgUnitDetails - useListOrgUnits', () => {
    const { t } = getPersonioTranslation('org-units');

    it('renders department details', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
        {
          features: {
            [FeatureFlags.ENABLE_LEADS]: 'on',
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByRole('heading', {
          name: 'Marketing Department',
        }),
      ).toBeInTheDocument();

      expect(
        screen.getByTestId(TestIds.DetailsDescriptionField),
      ).toHaveTextContent('Responsible for promoting products and services');

      const propertyListItems = screen.getAllByRole('listitem');

      const parentItem = within(propertyListItems[0]);
      expect(parentItem.getByText('Parent department')).toBeInTheDocument();
      expect(parentItem.getByText('-')).toBeInTheDocument();

      const resourceItem = within(propertyListItems[1]);
      expect(resourceItem.getByText('Resource')).toBeInTheDocument();
      expect(
        resourceItem.getByText('https://example.com/resource/1'),
      ).toBeInTheDocument();

      const codeItem = within(propertyListItems[2]);
      expect(codeItem.getByText('Code')).toBeInTheDocument();
      expect(codeItem.getByText('MKT')).toBeInTheDocument();

      const leadsItem = within(propertyListItems[4]);
      expect(leadsItem.getByText('Leads')).toBeInTheDocument();
      expect(leadsItem.getByText('John Doe')).toBeInTheDocument();
      expect(leadsItem.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('renders leads promo tag when leads promo tag flag is enabled', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
        {
          features: {
            [FeatureFlags.ENABLE_LEADS]: 'on',
            [FeatureFlags.ENABLE_LEADS_PROMO_TAG]: 'on',
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      const propertyListItems = screen.getAllByRole('listitem');
      const leadsItem = within(propertyListItems[4]);
      expect(leadsItem.getByTestId('leads-promo-tag')).toBeInTheDocument();
    });

    it('renders team details', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={159}
          type="team"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      await expect(
        screen.findByText('Parent team'),
      ).resolves.toBeInTheDocument();

      expect(
        screen.getByRole('listitem', { name: 'Sub-team' }),
      ).toBeInTheDocument();
    });

    it('renders parent token', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={51}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      const propertyListItems = screen.getAllByRole('listitem');
      const parentItem = within(propertyListItems[0]);
      expect(parentItem.getByText('Parent department')).toBeInTheDocument();
      expect(
        parentItem.getByRole('link', {
          name: 'Quality Assurance Department 2',
        }),
      ).toHaveAttribute('href', `${basePath}/departments/details/20`);
    });

    it('renders members count and correct link to people list', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(screen.getByText('59 members')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: t('details.people-list-link') }),
      ).toHaveAttribute(
        'href',
        `/staff?extra=${encodeURIComponent(
          JSON.stringify({
            filters: { department_id: ['1'] },
            columns: ['department_id'],
          }),
        )}`,
      );
    });

    it('renders descendants count and tokens', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={51}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      const propItem = await screen.findByRole('listitem', {
        name: 'Sub-departments',
      });
      const container = within(propItem);

      expect(
        container.getByRole('link', { name: 'Customer Service Department 5' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/62`);

      expect(
        container.getByRole('link', { name: 'Sales Department 5' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/79`);
      expect(
        container.getByRole('link', { name: 'R&D Department 14' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/189`);
      expect(
        container.getByRole('link', { name: 'Marketing Department 14' }),
      ).toHaveAttribute('href', `${basePath}/departments/details/231`);
    });

    it('renders loading state', () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );
      expect(
        screen.getByTestId('org-unit-details-loading-drawer'),
      ).toBeInTheDocument();
    });

    it('should navigate to edit mode when "edit" button is clicked', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);

      const mockOnEditClick = jest.fn();
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig({ onEditClick: mockOnEditClick })}
        />,
        {
          router: {
            pathname: `${basePath}/departments/details/1`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      userEvent.click(
        screen.getByRole('button', {
          name: 'Edit',
        }),
      );

      expect(mockOnEditClick).toHaveBeenCalled();
    });

    it('renders error message and navigates away when "Close" is clicked', async () => {
      server.use(ListOrgUnitsHandlers.httpErrorHandler);

      const mockOnCloseClick = jest.fn();
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig({ onCloseClick: mockOnCloseClick })}
        />,
        {
          router: {
            pathname: `${basePath}/departments/details/1`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(screen.getByText(t('error-state.title'))).toBeInTheDocument();
      expect(
        screen.getByText(t('error-state.description')),
      ).toBeInTheDocument();

      userEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(mockOnCloseClick).toHaveBeenCalled();
    });

    it('renders not found view when the org unit does not exist anymore', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);

      renderWithWrapper(
        <OrgUnitDetails
          id={10000}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
        {
          router: {
            pathname: `${basePath}/departments/details/10000`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByText(t('details.not-found-department-title')),
      ).toBeInTheDocument();
      expect(
        screen.getByText(t('details.not-found-department-description')),
      ).toBeInTheDocument();
    });

    it('clicks on the link and checks for the external link dialog', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={1}
          type="department"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByRole('heading', {
          name: 'Marketing Department',
        }),
      ).toBeInTheDocument();

      const propertyListItems = screen.getAllByRole('listitem');
      const resourceItem = within(propertyListItems[1]);

      expect(resourceItem.getByText('Resource')).toBeInTheDocument();

      userEvent.click(resourceItem.getByText('https://example.com/resource/1'));

      await waitFor(() => {
        expect(
          screen.getByRole('dialog', {
            name: t('table.external-link.dialog.title'),
          }),
        ).toBeInTheDocument();
      });

      expect(
        screen.getByText(t('table.external-link.dialog.title')),
      ).toBeInTheDocument();

      expect(
        within(screen.getByRole('dialog')).getByText(
          'https://example.com/resource/1',
        ),
      ).toBeInTheDocument();
    });

    it('clicks on the link and checks for internal redirect', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={4}
          type="team"
          drawerConfig={createDrawerConfig()}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.getByRole('heading', {
          name: 'Operations Team',
        }),
      ).toBeInTheDocument();

      const propertyListItems = screen.getAllByRole('listitem');
      const resourceItem = within(propertyListItems[1]);

      expect(resourceItem.getByText('Resource')).toBeInTheDocument();

      userEvent.click(
        resourceItem.getByText('https://personio.personio.com/resource/4'),
      );

      expect(
        screen.queryByRole('dialog', {
          name: t('table.external-link.dialog.title'),
        }),
      ).not.toBeInTheDocument();
    });

    it('renders team details with layer when global hierarchies is enabled', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={159}
          type="team"
          drawerConfig={createDrawerConfig()}
        />,
        {
          features: {
            [FeatureFlags.ENABLE_GLOBAL_HIERARCHIES]: 'on',
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      await expect(
        screen.findByText(t('attributes.layer')),
      ).resolves.toBeInTheDocument();
      expect(screen.getByText('Layer 1')).toBeInTheDocument();
    });

    it('should navigate to the Delete Dialog when "delete" button is clicked', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      const mockOnDeleteClick = jest.fn();

      renderWithWrapper(
        <OrgUnitDetails
          id={159}
          type="team"
          drawerConfig={createDrawerConfig({
            onDeleteClick: mockOnDeleteClick,
          })}
        />,
        {
          features: {
            [FeatureFlags.ENABLE_GLOBAL_HIERARCHIES]: 'on',
          },
          router: {
            pathname: `${basePath}/departments/details/159`,
          },
        },
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      userEvent.click(screen.getByTestId(TestIds.DeleteButton));

      expect(mockOnDeleteClick).toHaveBeenCalled();
    });
  });

  describe('OrgUnitDetails - without edit and delete callbacks', () => {
    it('should not render the edit and delete buttons when callbacks are not provided', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={159}
          type="team"
          drawerConfig={createDrawerConfig({
            onEditClick: undefined,
            onDeleteClick: undefined,
          })}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.queryByTestId(TestIds.DeleteButton),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('button', { name: 'Edit' }),
      ).not.toBeInTheDocument();
    });

    it('should not render parent and sub org units when config flags are false', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      renderWithWrapper(
        <OrgUnitDetails
          id={51}
          type="department"
          drawerConfig={createDrawerConfig({
            showParentOrgUnit: false,
            showSubOrgUnits: false,
          })}
        />,
      );

      await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

      expect(
        screen.queryByRole('listitem', { name: 'Parent department' }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole('listitem', { name: 'Sub-departments' }),
      ).not.toBeInTheDocument();
    });
  });
});
