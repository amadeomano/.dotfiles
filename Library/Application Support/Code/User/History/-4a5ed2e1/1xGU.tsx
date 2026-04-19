import { Suspense, useState } from 'react';

import {
  OrgUnitDetails,
  OrgUnitsEdit,
  OrgUnitsDelete,
  useOrgUnitDetailsState,
} from '@personio-web/employees-organizations-feature-org-units';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { useAuthContext } from '@personio-web/auth-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { type UseDrawerReturn } from './types';

type OrgUnitDetailsDrawerData = {
  orgUnitId?: number;
  orgUnitType?: 'department' | 'team';
  action?: 'view' | 'edit';
};

export const useOrgUnitDetailsDrawer = (): UseDrawerReturn<
  OrgUnitDetailsDrawerData,
  typeof OrgUnitDetailsDrawer
> => {
  const { state, setState } = useOrgUnitDetailsState();

  const isOpen = state !== null;

  const close = () => setState(null);

  return {
    isOpen,
    data: state ?? undefined,
    close,
    Drawer: OrgUnitDetailsDrawer,
  };
};

type Props = {
  orgUnitId?: number;
  orgUnitType?: 'department' | 'team';
  action?: 'view' | 'edit';
};

const OrgUnitDetailsDrawer = ({ orgUnitId, orgUnitType, action }: Props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { setState } = useOrgUnitDetailsState();
  const { companyId } = useAuthContext();

  const { isOn: isOnGH, isReady: isReadyGH } = useFeatureFlag(
    FeatureFlags.ENABLE_GLOBAL_HIERARCHIES,
  );
  const { isOn: isOnLeads, isReady: isReadyLeads } = useFeatureFlag(
    FeatureFlags.ENABLE_LEADS,
  );
  const isLeadsEnabled = isReadyLeads && isOnLeads;
  const isGlobalHierarchiesEnabled = isReadyGH && isOnGH;

  const { data } = useListOrgUnits({
    variables: {
      companyId,
      filter: `legacy_id == ${orgUnitId} && type == ${orgUnitType}`,
      pageSize: 1,
      includeAccessRights: true,
    },
    queryOptions: {
      enabled: Boolean(orgUnitId && orgUnitType),
    },
  });

  const hasAccessRights =
    data?.data?.orgUnits?.metadata?.accessRights?.permissionsList?.includes(
      'ROLE_PERMISSION_CAN_EDIT',
    );

  if (!orgUnitId || !orgUnitType) return null;
  const currentAction = action ?? 'view';

  return (
    <Suspense fallback={null}>
      {currentAction === 'view' && (
        <OrgUnitDetails
          id={orgUnitId}
          type={orgUnitType}
          drawerConfig={{
            showParentOrgUnit: false,
            showSubOrgUnits: false,
            onEditClick: hasAccessRights
              ? () => setState({ orgUnitId, orgUnitType, action: 'edit' })
              : undefined,
            onDeleteClick: hasAccessRights
              ? () => setState({ orgUnitId, orgUnitType, action: 'delete' })
              : undefined,
            onCloseClick: () => setState(null),
          }}
        />
      )}
      {currentAction === 'edit' && hasAccessRights && (
        <OrgUnitsEdit
          id={String(orgUnitId)}
          type={orgUnitType}
          isGlobalHierarchiesEnabled={isGlobalHierarchiesEnabled}
          isLeadsEnabled={isLeadsEnabled}
          drawerConfig={{
            onEditSuccess: () =>
              setState({ orgUnitId, orgUnitType, action: 'view' }),
            onEditCancel: () => setState(null),
            onDeleteClick: () => setIsDeleting(true),
          }}
        />
      )}
      {isDeleting && hasAccessRights && (
        <OrgUnitsDelete
          id={orgUnitId}
          type={orgUnitType}
          drawerConfig={{
            onCancel: () => setState(null),
            onDeleteSuccess: () => setState(null),
          }}
        />
      )}
    </Suspense>
  );
};
