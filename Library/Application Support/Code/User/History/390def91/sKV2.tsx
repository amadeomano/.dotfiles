import { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import {
  useListOrgUnits,
  useDeleteOrgUnit,
  useInvalidateQueries,
} from '@personio-web/employees-organizations-gofer';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { Translate } from '@personio-web/translate-component';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Dialog } from 'designSystem/component/dialog';
import { Stack, Inline } from 'designSystem/component/layout';
import { toaster } from 'designSystem/component/toaster';
import { type ParseKeys } from 'i18next';

import { useAuthContext } from '@personio-web/auth-context';
import { EmployeeListLink } from '../components/employee-list-link';
import { Skeleton } from '../components/skeleton';
import { useNavigation } from '../hooks';
import { TestIds } from '../utils/test-ids';
import { type OrgUnitsDeleteProps } from './types';
import styles from './OrgUnitsDelete.module.scss';

const deleteOrgUnitTranslationKeys: Record<
  'team' | 'department',
  Record<string, ParseKeys<'org-units'>>
> = {
  team: {
    title: 'write.delete-team',
    confirmDelete: 'write.delete-team-confirm-button-label',
    sucessDelete: 'write.delete-team-success-toast',
    failDelete: 'write.delete-team-fail-toast',
    affectedTitleKey: 'affected-sub-teams.title',
    affectedItemKey: 'affected-sub-teams.item-delete',
    affectedItemKeyRoot: 'affected-sub-teams.item-delete-root',
  },
  department: {
    title: 'write.delete-department',
    confirmDelete: 'write.delete-department-confirm-button-label',
    sucessDelete: 'write.delete-department-success-toast',
    failDelete: 'write.delete-department-fail-toast',
    affectedTitleKey: 'affected-sub-departments.title',
    affectedItemKey: 'affected-sub-teams.item-delete',
    affectedItemKeyRoot: 'affected-sub-teams.item-delete-root',
  },
};

type CascadedChangesList = {
  self: {
    name: string;
  };
  parent: {
    name: string;
  };
  parentIdChangeType?:
    | 'ATTRIBUTE_CHANGE_TYPE_UNSPECIFIED'
    | 'ATTRIBUTE_CHANGE_TYPE_UPDATED';
  rootIdChangeType?:
    | 'ATTRIBUTE_CHANGE_TYPE_UNSPECIFIED'
    | 'ATTRIBUTE_CHANGE_TYPE_UPDATED';
}[];

export const OrgUnitsDelete = ({
  id,
  type,
  drawerConfig,
}: OrgUnitsDeleteProps) => {
  const { companyId } = useAuthContext();
  const { t } = useTranslation('org-units');
  const {
    title,
    confirmDelete,
    sucessDelete,
    failDelete,
    affectedTitleKey,
    affectedItemKey,
    affectedItemKeyRoot,
  } = deleteOrgUnitTranslationKeys[type];
  const { navigate } = useNavigation();
  const { mutate, isLoading: isMutating } = useDeleteOrgUnit();
  const { invalidateListOrgUnitsQuery } = useInvalidateQueries();
  const [cascadedChangesList, setCascadedChangesList] =
    useState<CascadedChangesList>([]);

  const { isOn: isOnGH, isReady: isReadyGH } = useFeatureFlag(
    FeatureFlags.ENABLE_GLOBAL_HIERARCHIES,
  );
  const isGlobalHierarchiesEnabled = isReadyGH && isOnGH;

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
    },
    queryOptions: {
      enabled: Boolean(id) && Boolean(type),
    },
  });

  const orgUnit = data?.data?.orgUnits?.orgUnitsList?.[0] || null;

  /**
   * if there are org units assigned or if there are members assigned
   * it disables the delete and shows different actions to follow
   */
  const hasEmployeesAssigned = (orgUnit?.directMemberCount || 0) > 0;
  const hasOrgUnitAssignedAndOldFlow =
    (orgUnit?.descendants?.length || 0) > 0 && !isGlobalHierarchiesEnabled;

  const validateBeforeDelete = async () => {
    mutate(
      {
        id: { id: String(orgUnit?.id?.id) },
        validateOnly: true,
      },
      {
        onSuccess: (res) => {
          const rawList = (res.data?.orgUnit?.cascadedChangesList ||
            []) as CascadedChangesList;
          const filtered = rawList.filter(
            (item) =>
              item.parentIdChangeType === 'ATTRIBUTE_CHANGE_TYPE_UPDATED' ||
              item.rootIdChangeType === 'ATTRIBUTE_CHANGE_TYPE_UPDATED',
          );
          setCascadedChangesList(filtered);
        },
      },
    );
  };

  const onDelete = async () => {
    mutate(
      {
        id: { id: String(orgUnit?.id?.id) },
        validateOnly: false,
      },
      {
        onSuccess: () => {
          toaster.notify({
            description: t(sucessDelete),
            showCloseButton: true,
            variant: 'success',
          });

          invalidateListOrgUnitsQuery();
          drawerConfig?.onDeleteSuccess();
        },
        onError: () => {
          toaster.notify({
            description: t(failDelete),
            showCloseButton: true,
            variant: 'error',
          });
        },
      },
    );
  };

  const onCancel = () => {
    if (drawerConfig?.onCancel) drawerConfig.onCancel();
  };

  if (!isLoading && isError) {
    toaster.clearAll();
    toaster.notify({
      title: t('error-state.title'),
      description: t('error-state.description'),
      showCloseButton: true,
      variant: 'error',
    });
  }

  useEffect(() => {
    validateBeforeDelete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog.Util title={!isLoading ? t(title) : ''} open={true}>
      <Dialog.Content>
        {isLoading ? (
          <Stack space="gap-xlarge" className={styles.content}>
            <Skeleton testId="org-unit-delete-loading-dialog" height={32} />
            <Skeleton height={50} />
            <Skeleton height={78} />
          </Stack>
        ) : (
          <Stack space="gap-xlarge" className={styles.description}>
            {hasEmployeesAssigned && (
              <span>
                <Translate
                  i18nKey={
                    type === 'department'
                      ? 'validations.id.departments.employee-assigned'
                      : 'validations.id.teams.employee-assigned'
                  }
                  namespace={'org-units'}
                  components={{
                    'custom-link': (
                      <EmployeeListLink ids={[String(id)]} type={type} />
                    ),
                  }}
                />
              </span>
            )}

            {hasOrgUnitAssignedAndOldFlow &&
              !hasEmployeesAssigned &&
              (type === 'department'
                ? t('validations.id.reassign-children-department')
                : t('validations.id.reassign-children-team'))}

            {!hasEmployeesAssigned && !hasOrgUnitAssignedAndOldFlow && (
              <span data-test-id="delete-org-unit-description">
                <Translate
                  i18nKey="delete-dialog.content-detail.title"
                  values={{ name: orgUnit?.name }}
                  namespace={'org-units'}
                />
              </span>
            )}

            {isGlobalHierarchiesEnabled && cascadedChangesList.length > 0 && (
              <Stack space="gap-large" className={styles.affectedList}>
                <h5>{t(affectedTitleKey)}</h5>
                <Stack>
                  {cascadedChangesList.map((item) => {
                    const isRootUpdated =
                      item.rootIdChangeType === 'ATTRIBUTE_CHANGE_TYPE_UPDATED';
                    const i18nKeyToUse = isRootUpdated
                      ? affectedItemKeyRoot
                      : affectedItemKey;
                    return (
                      <Inline space="gap-xsmall">
                        <Translate
                          i18nKey={i18nKeyToUse}
                          values={{
                            name: item.self.name,
                            parent: item.parent?.name ?? '',
                          }}
                          namespace={'org-units'}
                        />
                      </Inline>
                    );
                  })}
                </Stack>
              </Stack>
            )}
          </Stack>
        )}
      </Dialog.Content>

      <Dialog.Footer>
        <ActionBar>
          <Actions.Secondary onClick={onCancel}>
            {t('write.cancel')}
          </Actions.Secondary>
          <Actions.Primary
            onClick={onDelete}
            variant="emphasisDestructive"
            disabled={
              isMutating ||
              isLoading ||
              hasEmployeesAssigned ||
              hasOrgUnitAssignedAndOldFlow
            }
            metadata={{ testId: TestIds.ConfirmDeleteButton }}
            loading={isMutating && !isLoading}
          >
            {t(confirmDelete)}
          </Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Util>
  );
};
