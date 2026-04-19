import { getPersonioTranslation } from '@personio-web/config-jest/src/helpers';
import {
  ListOrgUnitsHandlers,
  DeleteOrgUnitHandlers,
} from '@personio-web/employees-organizations-gofer/mocking';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { server } from '@personio-web/mocks/server';
import { renderWithWrapper } from '@personio-web/orchestrator-common/test-utils';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toaster } from 'designSystem/component/toaster';

import { OrgUnitsDelete } from './OrgUnitsDelete';

jest.mock('designSystem/component/toaster');

const basePath = 'organization/org-units';
const loadingTestId = 'org-unit-delete-loading-dialog';

describe('OrgUnitsDelete', () => {
  const { t } = getPersonioTranslation('org-units');
  beforeEach(() => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
  });

  it('should render org units delete confirmation with the selected org unit', async () => {
    renderWithWrapper(<OrgUnitsDelete id={2} type="department" />);

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    expect(
      screen.getByTestId('delete-org-unit-description'),
    ).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const onCancel = jest.fn();
    renderWithWrapper(
      <OrgUnitsDelete
        id={11}
        type="department"
        drawerConfig={{
          onCancel,
          onDeleteSuccess: jest.fn(),
        }}
      />,
      { router: { pathname: `${basePath}/departments/delete/11` } },
    );

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    userEvent.click(screen.getByRole('button', { name: t('write.cancel') }));

    expect(onCancel).toHaveBeenCalled();
  });

  it('should disable the "delete" action and prompt the user to unassign employees first', async () => {
    server.use(DeleteOrgUnitHandlers.defaultHandler);
    const mockPush = jest.fn();
    renderWithWrapper(<OrgUnitsDelete id={1} type="department" />, {
      router: {
        pathname: `${basePath}/departments/delete/11`,
        push: mockPush,
      },
    });

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/staff?extra=${encodeURIComponent(
        JSON.stringify({
          filters: { department_id: ['1'] },
          columns: ['department_id'],
        }),
      )}`,
    );

    expect(
      screen.getByRole('button', {
        name: t('write.delete-department-confirm-button-label'),
      }),
    ).toBeDisabled();
  });

  it('should disable the "delete" action and prompt the user to unassign org units first', async () => {
    server.use(DeleteOrgUnitHandlers.withCascadedChangesHandler);
    const mockPush = jest.fn();
    renderWithWrapper(<OrgUnitsDelete id={11} type="department" />, {
      router: {
        pathname: `${basePath}/departments/delete/11`,
        push: mockPush,
      },
      features: {
        [FeatureFlags.ENABLE_GLOBAL_HIERARCHIES]: 'on',
      },
    });

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    expect(
      screen.queryByText(t('validations.id.employee-assigned')),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('EO')).toBeInTheDocument();
    });
    expect(screen.getByText('OS')).toBeInTheDocument();
  });

  it('should call onSuccess when org unit deletion is successful', async () => {
    server.use(DeleteOrgUnitHandlers.defaultHandler);
    const onDeleteSuccess = jest.fn();
    renderWithWrapper(
      <OrgUnitsDelete
        id={2}
        type="department"
        drawerConfig={{
          onCancel: jest.fn(),
          onDeleteSuccess,
        }}
      />,
      { router: { pathname: `${basePath}/departments/delete/2` } },
    );

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    userEvent.click(
      screen.getByRole('button', {
        name: t('write.delete-department-confirm-button-label'),
      }),
    );

    await waitFor(() => {
      expect(toaster.notify).toHaveBeenCalledWith({
        description: t('write.delete-department-success-toast'),
        showCloseButton: true,
        variant: 'success',
      });
    });

    expect(onDeleteSuccess).toHaveBeenCalled();
  });

  it('should show an error when an org unit is not deleted successfully', async () => {
    server.use(DeleteOrgUnitHandlers.httpErrorHandler);
    const mockPush = jest.fn();
    renderWithWrapper(<OrgUnitsDelete id={2} type="department" />, {
      router: {
        pathname: `${basePath}/departments/delete/2`,
        push: mockPush,
      },
    });

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    userEvent.click(
      screen.getByRole('button', {
        name: t('write.delete-department-confirm-button-label'),
      }),
    );

    await waitFor(() => {
      expect(toaster.notify).toHaveBeenCalledWith({
        description: t('write.delete-department-fail-toast'),
        showCloseButton: true,
        variant: 'error',
      });
    });

    expect(mockPush).not.toHaveBeenCalledWith({
      pathname: `${basePath}/departments/`,
    });
  });

  it('should render an error toast when the org unit is not available', async () => {
    server.use(ListOrgUnitsHandlers.httpErrorHandler);
    renderWithWrapper(<OrgUnitsDelete id={11} type="department" />);

    await waitForElementToBeRemoved(screen.queryByTestId(loadingTestId));

    await waitFor(() => {
      expect(toaster.notify).toHaveBeenCalledWith({
        title: t('error-state.title'),
        description: t('error-state.description'),
        showCloseButton: true,
        variant: 'error',
      });
    });
  });
});
