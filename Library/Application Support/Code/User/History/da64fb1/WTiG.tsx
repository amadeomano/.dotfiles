import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  useGetOrgUnit,
  useListOrgUnits,
  useUpdateOrgUnit,
  useInvalidateQueries,
  type UpdateOrgUnitVariables,
  type UpdateOrgUnitMutationResult,
} from '@personio-web/employees-organizations-gofer';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { IconButton } from 'designSystem/component/button';
import { icons } from 'designSystem/component/icon';
import { Stack } from 'designSystem/component/layout';
import { Drawer } from 'designSystem/component/panel';
import { toaster } from 'designSystem/component/toaster';

import { useAuthContext } from '@personio-web/auth-context';
import { ErrorState } from '../components/error-state';
import { OrgUnitsForm } from '../components/org-units-form/OrgUnitsForm';
import { Skeleton } from '../components/skeleton';
import {
  captureUnhandledException,
  useIsRequiredFieldValid,
  useOrgUnitForm,
  useServerError,
} from '../hooks';
import { type OrgUnitsFormSchema } from '../types';
import { toEditRequestPayload, toFormValues } from '../utils';
import { TestIds } from '../utils/test-ids';
import { getOrgUnitId } from '../utils/getOrgUnitId';
import { OrgUnitsEditConfirmation } from './OrgUnitsEditConfirmation';
import { type OrgUnitsUpdateProps } from './types';
import styles from './OrgUnitsEdit.module.scss';

const translationKeys = {
  department: {
    drawerTitle: 'write.edit-department',
    toasterDescriptionKey: 'write.updated-department-description',
    deleteButtonLabel: 'write.delete-department-button-label',
  },
  team: {
    drawerTitle: 'write.edit-team',
    toasterDescriptionKey: 'write.updated-team-description',
    deleteButtonLabel: 'write.delete-team-button-label',
  },
} as const;

type OrgUnitLeadList = {
  personId: {
    id: string;
  };
}[];

export const OrgUnitsEdit = ({
  id,
  type,
  isGlobalHierarchiesEnabled,
  isLeadsEnabled,
  onEditSuccess,
  onEditCancel,
  onEditConfirmationCancel,
  onDeleteClick,
}: OrgUnitsUpdateProps) => {
  const { companyId } = useAuthContext();
  const { openDialog, closeDialog, dialogState, isDialogOfType } =
    useDialogContext();
  const { t } = useTranslation('org-units');
  const { drawerTitle, toasterDescriptionKey } = translationKeys[type];
  const { invalidateListOrgUnitsQuery } = useInvalidateQueries();
  const [cascadedChangesList, setCascadedChangesList] = useState<
    NonNullable<UpdateOrgUnitMutationResult['orgUnit']>['cascadedChangesList']
  >([]);

  // TODO OS-1341 replace with useGetOrgUnit when ULIDs are adopted
  // when using useGetOrgUnit, remove filter and pass id
  const { data, isLoading, isError } = useListOrgUnits({
    variables: {
      companyId,
      filter: `legacy_id == ${id} && type == ${type}`,
      includeDepartmentId: type === 'department',
      includeTeamId: type === 'team',
      includeAncestors: true,
      includeAncestorNames: true,
      includeDirectMemberCount: true,
      includeDescendants: true,
      includeDescendantNames: true,
      includeLeads: true,
    },
    queryOptions: {
      enabled: Boolean(Number(id)),
    },
  });

  const orgUnit = data?.data?.orgUnits?.orgUnitsList?.[0] || null;

  const confirmationData = isDialogOfType(
    'org-units.edit.confirmation',
    dialogState,
  )
    ? dialogState.data
    : undefined;

  /**
   * When the parent id is changed to another one we trigger a new request.
   * The request is trigger only when `confirmationData.newParentId` has a value.
   */
  const { data: newParentOrgUnitData } = useGetOrgUnit({
    variables: {
      id: confirmationData?.newParentId ?? '',
      companyId,
    },
    queryOptions: {
      enabled: Boolean(confirmationData?.newParentId),
    },
  });

  const newParentOrgUnit = newParentOrgUnitData?.data?.orgUnit || null;

  const { mutate, isLoading: isMutating } = useUpdateOrgUnit();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    setValue,
    formState: { isDirty, errors, isSubmitted },
  } = useOrgUnitForm(type, id);
  const hasErrors = Object.values(errors).length > 0;
  // disables submit button if there are errors after submit
  const shouldDisableAfterSubmit = isSubmitted && hasErrors;
  const shouldDisable =
    !useIsRequiredFieldValid(watch) ||
    isLoading ||
    !isDirty ||
    shouldDisableAfterSubmit;
  const { handleMutationServerErrors } = useServerError(type);

  const verifyOrgUnit = (requestBody: UpdateOrgUnitVariables) => {
    mutate(
      {
        ...requestBody,
        // Satisfying the type check
        orgUnitLeadsList: requestBody.orgUnitLeadsList as OrgUnitLeadList,
        validateOnly: true,
      },
      {
        onSuccess: (response) => {
          let hasParentOrCascadedChanges =
            orgUnit?.parentId?.id !== requestBody.parentId?.id;

          if (
            response.data?.orgUnit?.cascadedChangesList &&
            response.data?.orgUnit?.cascadedChangesList.length > 0
          ) {
            hasParentOrCascadedChanges = true;

            const list = response.data?.orgUnit?.cascadedChangesList.filter(
              (item) => Boolean(item?.layerLevel) && item?.self?.name,
            );
            setCascadedChangesList(list);
          } else if (response.data?.orgUnit && !hasParentOrCascadedChanges) {
            updateOrgUnit(requestBody);
          } else if (response.errors) {
            handleMutationServerErrors(response.errors, setError);
          }

          if (
            hasParentOrCascadedChanges &&
            (response.errors ?? []).length === 0
          ) {
            openDialog('org-units.edit.confirmation', {
              newParentId: requestBody.parentId?.id,
              currentOrgUnitName: requestBody.name,
            });
          }
        },
        onError: () => {
          captureUnhandledException(type, {
            title: t('generic-error.glitch'),
            description: t('generic-error.description'),
          });
        },
      },
    );
  };

  const updateOrgUnit = (requestBody: UpdateOrgUnitVariables) => {
    mutate(
      {
        ...requestBody,
        // Satisfying the type check
        orgUnitLeadsList: requestBody.orgUnitLeadsList as OrgUnitLeadList,
        validateOnly: false,
      },
      {
        onSuccess: (response) => {
          if (response.data?.orgUnit) {
            toaster.notify({
              variant: 'success',
              title: t('write.toast-success'),
              description: t(toasterDescriptionKey),
              showCloseButton: true,
            });

            invalidateListOrgUnitsQuery();

            // TODO OS-1341 replace with orgUnit?.id?.id when ULIDs are adopted
            const orgUnitId = getOrgUnitId(orgUnit, type);
            if (orgUnitId) onEditSuccess(orgUnitId);
          } else if (response.errors) {
            handleMutationServerErrors(response.errors, setError);
          }
        },
        onError: () => {
          captureUnhandledException(type, {
            title: t('generic-error.glitch'),
            description: t('generic-error.description'),
          });
        },
      },
    );
  };

  const onSubmit = (payload: OrgUnitsFormSchema) => {
    const requestBody = toEditRequestPayload(
      payload,
      type,
      String(orgUnit?.id?.id),
      isGlobalHierarchiesEnabled,
      isLeadsEnabled,
    );

    verifyOrgUnit(requestBody);
  };

  const onSubmitConfirmation = (payload: OrgUnitsFormSchema) => {
    updateOrgUnit(
      toEditRequestPayload(
        payload,
        type,
        String(orgUnit?.id?.id),
        isGlobalHierarchiesEnabled,
        isLeadsEnabled,
      ),
    );
    closeDialog();
  };

  const onCancelConfirmation = useCallback(() => {
    setCascadedChangesList([]);
    closeDialog();
    onEditConfirmationCancel?.();
  }, [closeDialog, onEditConfirmationCancel]);

  const onCancel = useCallback(() => {
    reset();
    onEditCancel();
  }, [reset, onEditCancel]);

  const handleDelete = useCallback(() => {
    onDeleteClick();
  }, [onDeleteClick]);

  /**
   * Once we update to react-hook-form > 7.4.1 we can use the new API
   * which simplifies this https://www.react-hook-form.com/api/useform/#values
   */
  useEffect(() => {
    if (orgUnit) {
      reset(toFormValues(orgUnit));
    }
  }, [reset, orgUnit]);

  if (!isLoading && isError) {
    return <ErrorState onClose={onCancel} />;
  }

  return (
    <Drawer>
      <Drawer.NavigationBar>
        <IconButton
          icon={icons.trash}
          metadata={{ testId: TestIds.DeleteButton }}
          variant="ghost"
          aria-label="Remove"
          onClick={handleDelete}
        />
      </Drawer.NavigationBar>
      <Drawer.Content title={t(drawerTitle)}>
        {isLoading ? (
          <>
            <Skeleton testId="org-units-edit-skeleton" height={24} />
            <Stack space="gap-xlarge">
              <Skeleton height={28} />
              <Skeleton height={238} />
            </Stack>
          </>
        ) : (
          <div className={styles.drawerBody}>
            {(confirmationData || cascadedChangesList?.length > 0) && (
              <OrgUnitsEditConfirmation
                type={type}
                previousParentName={confirmationData?.currentOrgUnitName ?? ''}
                newParentName={newParentOrgUnit?.orgUnit?.name ?? ''}
                onSubmit={handleSubmit(onSubmitConfirmation)}
                onCancel={onCancelConfirmation}
                cascadedChangesList={cascadedChangesList}
              />
            )}
            <OrgUnitsForm
              control={control}
              errors={errors}
              id={id}
              type={type}
              metadata={{ testId: 'edit-form' }}
              setValue={setValue}
              watch={watch}
            />
          </div>
        )}
      </Drawer.Content>
      <ActionBar>
        <Actions.Primary
          onClick={handleSubmit(onSubmit)}
          disabled={shouldDisable}
          metadata={{ testId: TestIds.SubmitChangesButton }}
          loading={isMutating}
        >
          {t('write.save')}
        </Actions.Primary>
        <Actions.Secondary variant="ghost" onClick={onCancel}>
          {t('write.cancel')}
        </Actions.Secondary>
      </ActionBar>
    </Drawer>
  );
};
