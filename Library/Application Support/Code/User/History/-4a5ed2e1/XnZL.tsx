import { Suspense } from 'react';

import {
  OrgUnitDetails,
  OrgUnitsEdit,
  OrgUnitsDelete,
  useOrgUnitDetailsState,
} from '@personio-web/employees-organizations-feature-org-units';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';
import { useAuthContext } from '@personio-web/auth-context';

import { type UseDrawerReturn } from './types';

type OrgUnitDetailsDrawerData = {
  orgUnitId?: number;
  orgUnitType?: 'department' | 'team';
  action?: 'view' | 'edit' | 'delete';
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
  action?: 'view' | 'edit' | 'delete';
};

const OrgUnitDetailsDrawer = ({ orgUnitId, orgUnitType, action }: Props) => {
  const { setState } = useOrgUnitDetailsState();
  const { companyId } = useAuthContext();

  const { data } = useListOrgUnits({
    variables: {
      companyId,
      filter: `id == ${orgUnitId} && type == ${orgUnitType}`,
      pageSize: 1,
      includeAccessRights: true,
    },
    queryOptions: {
      enabled: orgUnitId && orgUnitType,
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
          onEditCancel={() => setState(null)}
          onEditSuccess={() =>
            setState({ orgUnitId, orgUnitType, action: 'view' })
          }
          onDeleteClick={() =>
            setState({ orgUnitId, orgUnitType, action: 'delete' })
          }
        />
      )}
      {currentAction === 'delete' && hasAccessRights && (
        <OrgUnitsDelete id={orgUnitId} type={orgUnitType} />
      )}
    </Suspense>
  );
};
