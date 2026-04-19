import { Suspense } from 'react';

import {
  OrgUnitDetails,
  OrgUnitsEdit,
  OrgUnitsDelete,
  useOrgUnitDetailsState,
} from '@personio-web/employees-organizations-feature-org-units';

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
  console.log('[] state is', state);

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
  console.log('[] state changed', orgUnitId, orgUnitType, action);

  if (!orgUnitId || !orgUnitType) {
    return null;
  }

  const currentAction = action ?? 'view';

  const handleDeleteClick = () => {
    setState({ orgUnitId, orgUnitType, action: 'delete' });
  };

  const handleCloseClick = () => {
    setState(null);
  };

  return (
    <Suspense fallback={null}>
      {currentAction === 'view' && (
        <OrgUnitDetails
          id={orgUnitId}
          type={orgUnitType}
          drawerConfig={{
            showParentOrgUnit: false,
            showSubOrgUnits: false,
            onEditClick: () =>
              setState({ orgUnitId, orgUnitType, action: 'edit' }),
            onDeleteClick: handleDeleteClick,
            onCloseClick: handleCloseClick,
          }}
        />
      )}
      {currentAction === 'edit' && (
        <OrgUnitsEdit id={String(orgUnitId)} type={orgUnitType} />
      )}
      {currentAction === 'delete' && (
        <OrgUnitsDelete id={orgUnitId} type={orgUnitType} />
      )}
    </Suspense>
  );
};
