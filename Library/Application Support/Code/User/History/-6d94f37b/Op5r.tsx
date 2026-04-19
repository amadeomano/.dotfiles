import { useCallback } from 'react';

import { useTranslation } from 'react-i18next';
import { useListOrgUnits } from '@personio-web/employees-organizations-gofer';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { EMPTY_VALUE_PLACEHOLDER } from '@personio-web/employees-organizations-util-org-units';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Drawer } from 'designSystem/component/panel';
import { IconButton } from 'designSystem/component/button';
import { icons } from 'designSystem/component/icon';
import { PropertyList } from 'designSystem/component/property-list';

import { useAuthContext } from '@personio-web/auth-context';
import { Stack } from 'designSystem/component/layout';
import { ErrorState } from '../components/error-state';
import { ExternalLinkDialog } from '../components/external-link-dialog';
import { LoadingState } from '../components/loading-state/LoadingState';
import { NotFoundState } from '../components/not-found-state/NotFoundState';
import { useNavigation } from '../hooks';
import { usePanelTitle } from '../utils/usePanelTitle';
import { TestIds } from '../utils/test-ids';
import { type OrgUnitResult } from '../types';
import { MembersList } from './MembersList/MembersList';
import { TotalMembers } from './Properties/TotalMembers';
import { type Props } from './types';
import { ParentName } from './Properties/ParentName';
import { Resource } from './Properties/Resource';
import { Abbreviation } from './Properties/Abbreviation';
import { Layer } from './Properties/Layer';
import { Leads } from './Properties/Leads';
import { SubOrgUnits } from './Properties/SubOrgUnits';
import styles from './OrgUnitDetails.module.scss';

export const OrgUnitDetails: React.FC<Props> = ({ id, type, viewOnly }) => {
  const { companyId } = useAuthContext();
  const { t } = useTranslation('org-units');
  const { closeDialog, dialogState, isDialogOfType } = useDialogContext();
  const { navigate } = useNavigation();

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
      enabled: Boolean(Number(id)) && Boolean(type),
    },
  });

  const orgUnit: OrgUnitResult | null =
    data?.data?.orgUnits?.orgUnitsList?.[0] || null;

  const { panelRef, panelTitle } = usePanelTitle(orgUnit?.name ?? '');

  const onClose = useCallback(() => {
    navigate.push('/');
  }, [navigate]);

  const onEdit = useCallback(() => {
    navigate.push(`/edit/${id}`);
  }, [navigate, id]);

  const onDelete = useCallback(() => {
    navigate.push(`/delete/${id}`);
  }, [navigate, id]);

  if (!orgUnit) {
    // Gofer brings 200 and empty array when org unit is not found
    const isOrgUnitNotFound = !isLoading && !orgUnit && !isError;

    if (isLoading) {
      return <LoadingState />;
    }

    if (isOrgUnitNotFound) {
      return <NotFoundState type={type} />;
    }

    if (isError) {
      return <ErrorState onClose={onClose} />;
    }

    return null;
  }

  return (
    <Drawer drawerRef={}>
      <Drawer.NavigationBar>
        {!viewOnly && (
          <IconButton
            icon={icons.trash}
            metadata={{ testId: TestIds.DeleteButton }}
            variant="ghost"
            aria-label="Remove"
            onClick={onDelete}
          />
        )}
      </Drawer.NavigationBar>
      <Drawer.Content title={orgUnit.name}>
        {isDialogOfType('org-units.details.external-link', dialogState) && (
          <ExternalLinkDialog
            closeDialog={closeDialog}
            uri={dialogState.data.uri}
          />
        )}
        <div className={styles.drawerBody}>
          <p data-test-id={TestIds.DetailsDescriptionField}>
            {orgUnit.description || EMPTY_VALUE_PLACEHOLDER}
          </p>
          <Stack space="gap-default">
            <h5>{t('details.heading')}</h5>
            <PropertyList className={styles.propertyList}>
              {!viewOnly && <ParentName orgUnit={orgUnit} type={type} />}
              <Resource orgUnit={orgUnit} />
              <Abbreviation orgUnit={orgUnit} />
              <Layer orgUnit={orgUnit} />
              {!viewOnly && <SubOrgUnits orgUnit={orgUnit} type={type} />}
              <TotalMembers orgUnit={orgUnit} type={type} />
              <Leads orgUnit={orgUnit} />
            </PropertyList>
          </Stack>
          <MembersList orgUnit={orgUnit} type={type} />
        </div>
      </Drawer.Content>
      {!viewOnly && (
        <ActionBar>
          <Actions.Primary
            variant="emphasisAccent"
            onClick={onEdit}
            metadata={{ testId: TestIds.EditButton }}
          >
            {t('details.edit')}
          </Actions.Primary>
        </ActionBar>
      )}
    </Drawer>
  );
};
