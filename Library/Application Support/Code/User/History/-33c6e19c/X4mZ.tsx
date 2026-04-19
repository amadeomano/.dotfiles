import { getPersonioTranslation } from '@personio-web/config-jest/src/helpers';
import { getFeatureAccessHandlers } from '@personio-web/employees-organizations-data-feature-access/mocking';
import { ListOrgUnitsHandlers } from '@personio-web/employees-organizations-gofer/mocking';
import { server } from '@personio-web/mocks/server';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import * as orgUnitsFeature from '@personio-web/employees-organizations-feature-org-units';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import mockRouter from 'next-router-mock';

import { OrgUnits } from '..';

const OrgUnitsEdit = jest.spyOn(orgUnitsFeature, 'OrgUnitsEdit');

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

jest.mock('@personio-web/design-system-brand-config', () => ({
  useBrandConfig: jest.fn(() => ({
    visualLanguageUpdate: true,
  })),
}));

describe('OrgUnitsView', () => {
  beforeEach(() => {
    server.use(getFeatureAccessHandlers.defaultHandler);
  });

  const { t: tDesignSystem } = getPersonioTranslation('design-system');

  beforeEach(() => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
  });

  it('should render OrgUnits view with breadcrumbs', async () => {
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByTestId('org-units-table')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', {
        name: tDesignSystem('page.navigation-bar.close-aria-label'),
      }),
    ).toBeInTheDocument();
  });

  it('should render OrgUnits Create', async () => {
    mockRouter.push('/organization/org-units/departments/create');

    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: 'Add department' }),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId('org-units-table')).toBeInTheDocument();

    expect(mockRouter).toMatchObject({
      asPath: '/organization/org-units/departments/create',
    });
  });

  it('should render OrgUnits Edit', async () => {
    mockRouter.push('/organization/org-units/departments/edit/1');
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByTestId('org-units-table')).toBeInTheDocument();
    });
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    expect(mockRouter).toMatchObject({
      asPath: '/organization/org-units/departments/edit/1',
    });
  });

  it('should render OrgUnits Details', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
    mockRouter.push('/organization/org-units/departments/details/1');

    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByTestId('org-units-table')).toBeInTheDocument();
    });

    expect(
      screen.getByTestId('org-unit-details-loading-drawer'),
    ).toBeInTheDocument();

    await waitForElementToBeRemoved(
      screen.queryByTestId('org-unit-details-loading-drawer'),
    );

    expect(
      screen.getByRole('heading', {
        name: 'Marketing Department',
      }),
    ).toBeInTheDocument();
    expect(mockRouter).toMatchObject({
      asPath: '/organization/org-units/departments/details/1',
    });
  });

  it('should render OrgUnits Delete', async () => {
    mockRouter.push('/organization/org-units/departments/delete/1');
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByTestId('org-units-table')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', {
          name: 'Delete department?',
        }),
      ).toBeInTheDocument();
    });

    expect(mockRouter).toMatchObject({
      asPath: '/organization/org-units/departments/delete/1',
    });
  });

  it('should display correct message for departments', async () => {
    mockRouter.push('/organization/org-units/departments');
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByText('Departments')).toBeInTheDocument();
    });
    expect(screen.getByText(/Use departments/)).toBeInTheDocument();
  });

  it('should display correct message for teams', async () => {
    mockRouter.push('/organization/org-units/teams');
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByText('Teams')).toBeInTheDocument();
    });
    expect(screen.getByText(/Use teams/)).toBeInTheDocument();
  });

  it('should render the "here" link correctly', async () => {
    mockRouter.push('/organization/org-units/departments');
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(screen.getByTestId('org-units-table')).toBeInTheDocument();
    });

    const linkElement = screen.getByRole('link', { name: /here/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('target', '_blank');
    expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    expect(linkElement).toHaveAttribute(
      'href',
      expect.stringMatching(/articles\/18862110441885/i),
    );
  });

  it('should handle panel opening and closing correctly', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
    mockRouter.push('/organization/org-units/departments/details/1');
    renderWithWrapper(<OrgUnits />);

    await waitFor(() => {
      expect(
        screen.getByTestId('org-unit-details-loading-drawer'),
      ).toBeInTheDocument();
    });

    await waitForElementToBeRemoved(
      screen.queryByTestId('org-unit-details-loading-drawer'),
    );

    await expect(
      screen.findByRole('heading', { name: 'Marketing Department' }),
    ).resolves.toBeInTheDocument();

    const closeButton = within(screen.getByRole('dialog')).getByRole('button', {
      name: /close/i,
    });
    closeButton.click();

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        asPath: '/organization/org-units/departments',
      });
    });
  });

  it('should navigate to edit when Edit button is clicked in details drawer', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
    mockRouter.push('/organization/org-units/departments/details/1');
    renderWithWrapper(<OrgUnits />);

    await expect(
      screen.findByRole('heading', { name: 'Marketing Department' }),
    ).resolves.toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: 'Edit' });
    editButton.click();

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        asPath: '/organization/org-units/departments/edit/1',
      });
    });
  });

  it('should navigate to delete when Delete button is clicked in details drawer', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
    mockRouter.push('/organization/org-units/departments/details/1');
    renderWithWrapper(<OrgUnits />);

    await expect(
      screen.findByRole('heading', { name: 'Marketing Department' }),
    ).resolves.toBeInTheDocument();

    const deleteButton = screen.getByLabelText('Remove');
    deleteButton.click();

    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        asPath: '/organization/org-units/departments/delete/1',
      });
    });
  });

  describe('Edit Drawer', () => {
    it('should close the drawer when cancel is pressed', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      mockRouter.push('/organization/org-units/departments/edit/1');
      renderWithWrapper(<OrgUnits />);

      await waitFor(() => expect(OrgUnitsEdit).toHaveBeenCalled());
      const props = OrgUnitsEdit.mock.calls[0][0];
      props.drawerConfig?.onEditCancel();

      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          asPath: '/organization/org-units/departments',
        });
      });
    });

    it('should navigate back to details when Editing is done', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      mockRouter.push('/organization/org-units/departments/edit/1');
      renderWithWrapper(<OrgUnits />);

      await waitFor(() => expect(OrgUnitsEdit).toHaveBeenCalled());
      const props = OrgUnitsEdit.mock.calls[0][0];
      props.drawerConfig?.onEditSuccess('1');

      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          asPath: '/organization/org-units/departments/details/1',
        });
      });
    });

    it('should navigate to delete when delete button is pressed', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      mockRouter.push('/organization/org-units/departments/edit/1');
      renderWithWrapper(<OrgUnits />);

      await waitFor(() => expect(OrgUnitsEdit).toHaveBeenCalled());
      const props = OrgUnitsEdit.mock.calls[0][0];
      props.onDeleteClick();

      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          asPath: '/organization/org-units/departments/delete/1',
        });
      });
    });

    it('should navigate back to Edititng when Editing is not confirmed', async () => {
      server.use(ListOrgUnitsHandlers.defaultHandler);
      mockRouter.push('/organization/org-units/departments/edit/1');
      renderWithWrapper(<OrgUnits />);

      await waitFor(() => expect(OrgUnitsEdit).toHaveBeenCalled());
      const props = OrgUnitsEdit.mock.calls[0][0];
      props.onEditConfirmationCancel?.();

      await waitFor(() => {
        expect(mockRouter).toMatchObject({
          asPath: '/organization/org-units/departments/edit/1',
        });
      });
    });
  });
});
