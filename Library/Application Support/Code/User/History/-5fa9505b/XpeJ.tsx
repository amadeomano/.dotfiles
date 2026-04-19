import { type ReactElement } from 'react';

import { getPersonioTranslation } from '@personio-web/config-jest/src/helpers';
import {
  GetOrgUnitHandlers,
  ListOrgUnitsHandlers,
  ListOrgUnitsLayersHandlers,
  UpdateOrgUnitHandlers,
} from '@personio-web/employees-organizations-gofer/mocking';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useQueryOrgUnits } from '@personio-web/employees-organizations-hook-use-query-org-units';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { server } from '@personio-web/mocks/server';
import {
  renderWithWrapper as renderWithWrapperBase,
  renderHookWithWrapper,
} from '@personio-web/orchestrator-common/test-utils';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toaster } from 'designSystem/component/toaster';

import { TestIds } from '../utils/test-ids';
import { OrgUnitsEdit } from '.';

jest.mock('designSystem/component/toaster');

const push = jest.fn();
const back = jest.fn();
const formParentId = 'edit-form-parent-id-field-picker';

jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push,
    back,
    asPath: 'organization/org-units/departments/edit/1',
  })),
}));

jest.setTimeout(30000);

const renderWithWrapper = (component: ReactElement, options = {}) => {
  return renderWithWrapperBase(
    <DialogProvider>{component}</DialogProvider>,
    options,
  );
};

describe('OrgUnitsEdit', () => {
  const { t } = getPersonioTranslation('org-units');
  beforeEach(() => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
    server.use(GetOrgUnitHandlers.defaultDepartmentHandler);
  });

  it('should render org units form with expected fields and values', async () => {
    renderWithWrapper(
      <OrgUnitsEdit type="department" id="1" isLeadsEnabled />,
      {
        features: {
          [FeatureFlags.ENABLE_LEADS]: 'on',
        },
      },
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('org-units-leads-picker')).toBeInTheDocument();
    });

    expect(screen.getByRole('navigation')).toBeInTheDocument();

    expect(
      screen.getByRole('textbox', { name: t('attributes.name') }),
    ).toHaveValue('Marketing Department');
    expect(
      screen.getByRole('textbox', { name: t('attributes.about') }),
    ).toHaveValue('Responsible for promoting products and services');
    expect(
      screen.getByRole('textbox', { name: t('attributes.abbreviation') }),
    ).toHaveValue('MKT');
    expect(
      screen.getByRole('textbox', { name: t('attributes.resource') }),
    ).toHaveValue('https://example.com/resource/1');
  });

  it('should render leads picker with promo tag when leads promo tag flag is enabled', async () => {
    renderWithWrapper(
      <OrgUnitsEdit type="department" id="1" isLeadsEnabled />,
      {
        features: {
          [FeatureFlags.ENABLE_LEADS]: 'on',
          [FeatureFlags.ENABLE_LEADS_PROMO_TAG]: 'on',
        },
      },
    );

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId('org-units-leads-picker')).toBeInTheDocument();
      expect(screen.getByTestId('leads-promo-tag')).toBeInTheDocument();
    });
  });

  it('should navigate away from the edit dialog when "cancel" is clicked', async () => {
    const onEditCancel = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        drawerConfig={{
          onEditSuccess: jest.fn(),
          onEditCancel: onEditCancel,
          onDeleteClick: jest.fn(),
        }}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onEditCancel).toHaveBeenCalled();
  });

  it('should navigate to the Delete Dialog when "delete" button is clicked', async () => {
    const onDeleteClick = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onDeleteClick={onDeleteClick}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    userEvent.click(screen.getByTestId(TestIds.DeleteButton));

    expect(onDeleteClick).toHaveBeenCalled();
  });

  it('should have submit action disabled if there are no changes in the form', async () => {
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('should update a valid org unit and navigate to the details of org units', async () => {
    server.use(UpdateOrgUnitHandlers.defaultHandler);
    const onEditSuccess = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={onEditSuccess}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    const orgUnitNameField = screen.getByRole('textbox', {
      name: t('attributes.name'),
    });

    userEvent.clear(orgUnitNameField);
    userEvent.paste(orgUnitNameField, 'Marketing Department & Tech');

    userEvent.click(
      screen.getByRole('button', { name: t('write.save') }),
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    await waitFor(() => {
      expect(toaster.notify).toHaveBeenCalledWith({
        description: t('write.updated-department-description'),
        showCloseButton: true,
        title: t('write.toast-success'),
        variant: 'success',
      });
    });

    expect(onEditSuccess).toHaveBeenCalledWith('1');
  });

  it('should update a valid org unit show confirmation update and navigate to the details of org units', async () => {
    server.use(UpdateOrgUnitHandlers.defaultHandler);
    const onEditSuccess = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={onEditSuccess}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    renderHookWithWrapper(() =>
      useQueryOrgUnits({
        type: 'department',
        search: 'Department',
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    // trigger select
    userEvent.click(await screen.findByTestId(formParentId));

    await waitFor(() => {
      // list of options
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // pick option from popover listbox
    userEvent.click(
      screen.getByRole('option', {
        name: 'Finance Department',
      }),
    );

    userEvent.click(
      screen.getByRole('button', { name: t('write.save') }),
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: t('move.button-department'),
      }),
    );

    await waitFor(() => {
      expect(toaster.notify).toHaveBeenCalledWith({
        description: t('write.updated-department-description'),
        showCloseButton: true,
        title: t('write.toast-success'),
        variant: 'success',
      });
    });

    expect(onEditSuccess).toHaveBeenCalledWith('1');
  });

  it('should aim to update a valid org unit show and cancel confirmation', async () => {
    server.use(UpdateOrgUnitHandlers.defaultHandler);
    const onEditConfirmationCancel = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onEditConfirmationCancel={onEditConfirmationCancel}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    renderHookWithWrapper(() =>
      useQueryOrgUnits({
        type: 'department',
        search: 'Department',
      }),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    // trigger select
    userEvent.click(await screen.findByTestId(formParentId));

    await waitFor(() => {
      // list of options
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // pick option from popover listbox
    userEvent.click(
      screen.getByRole('option', {
        name: 'Finance Department',
      }),
    );

    userEvent.click(
      screen.getByRole('button', { name: t('write.save') }),
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: t('write.cancel'),
      }),
    );

    await waitFor(() => {
      expect(onEditConfirmationCancel).toHaveBeenCalled();
    });

    expect(toaster.notify).not.toHaveBeenCalledWith({
      description: t('write.updated-department-description'),
      showCloseButton: true,
      title: t('write.toast-success'),
      variant: 'success',
    });
  });

  it('should have "submit button" disabled if no fields are updated', async () => {
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    const saveButton = screen.getByRole('button', { name: t('write.save') });

    expect(saveButton).toBeDisabled();

    // clearing required field should still keep disabled state
    userEvent.clear(
      screen.getByRole('textbox', { name: t('attributes.name') }),
    );

    expect(saveButton).toBeDisabled();

    // aim to sumbit without required field
    userEvent.click(saveButton);

    // adds required field back
    userEvent.paste(
      screen.getByRole('textbox', { name: t('attributes.name') }),
      'Org team',
    );

    // button must enabled
    expect(saveButton).toBeEnabled();
  });

  it('should display error view if it fails to load selected org unit into the form', async () => {
    server.use(GetOrgUnitHandlers.httpErrorHandler);
    server.use(ListOrgUnitsHandlers.httpErrorHandler);
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    await expect(
      screen.findByText(t('error-state.title')),
    ).resolves.toBeInTheDocument();
    await expect(
      screen.findByText(t('error-state.description')),
    ).resolves.toBeInTheDocument();
  });

  it('should notify user when an org unit is NOT successfully updated and an KNOWN error is returned', async () => {
    server.use(UpdateOrgUnitHandlers.graphqlErrorHandler);
    const onEditSuccess = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={onEditSuccess}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    // adds required field but something happened in the server
    const orgUnitNameField = screen.getByRole('textbox', {
      name: t('attributes.name'),
    });

    userEvent.clear(orgUnitNameField);
    userEvent.paste(orgUnitNameField, 'Marketing Department & Tech');

    userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await expect(
      screen.findByText(
        'Assigning this department to itself or one of its sub-departments is not allowed.',
      ),
    ).resolves.toBeInTheDocument();

    expect(onEditSuccess).not.toHaveBeenCalled();
  });

  it('should notify user when an org unit is NOT successfully updated and an UKNOWN error is returned', async () => {
    server.use(UpdateOrgUnitHandlers.httpErrorHandler);
    const onEditSuccess = jest.fn();
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={onEditSuccess}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    // adds required field but something happened in the server
    const orgUnitNameField = screen.getByRole('textbox', {
      name: t('attributes.name'),
    });

    userEvent.clear(orgUnitNameField);
    userEvent.paste(orgUnitNameField, 'Marketing Department & Tech');

    userEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(toaster.notify).toHaveBeenCalledWith({
        description: t('generic-error.description'),
        showCloseButton: true,
        title: t('generic-error.glitch'),
        variant: 'error',
      });
    });

    expect(onEditSuccess).not.toHaveBeenCalled();
  });

  it('should render org units form with layer field when global hierarchies is enabled', async () => {
    server.use(ListOrgUnitsLayersHandlers.defaultHandler);
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
      {
        features: {
          [FeatureFlags.ENABLE_GLOBAL_HIERARCHIES]: 'on',
        },
      },
    );

    await expect(
      screen.findByText(t('attributes.layer')),
    ).resolves.toBeInTheDocument();
  });

  it('verify cascaded changes list is displayed when org unit is moved to a different layer', async () => {
    server.use(UpdateOrgUnitHandlers.withCascadedChangesHandler);
    renderWithWrapper(
      <OrgUnitsEdit
        type="department"
        id="1"
        onEditSuccess={jest.fn()}
        onEditCancel={jest.fn()}
        onDeleteClick={jest.fn()}
      />,
    );

    // assert loading
    expect(screen.getByTestId('org-units-edit-skeleton')).toBeInTheDocument();

    // await for loading to finish
    await waitForElementToBeRemoved(
      screen.queryByTestId('org-units-edit-skeleton'),
    );

    await waitFor(() => {
      expect(screen.getByTestId(formParentId)).toBeEnabled();
    });

    const orgUnitNameField = screen.getByRole('textbox', {
      name: t('attributes.name'),
    });

    userEvent.clear(orgUnitNameField);
    userEvent.paste(orgUnitNameField, 'Marketing Department & Tech');

    userEvent.click(
      screen.getByRole('button', { name: t('write.save') }),
      undefined,
      {
        skipPointerEventsCheck: true,
      },
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      screen.getByText(t('affected-sub-departments.title')),
    ).toBeInTheDocument();
  });
});
