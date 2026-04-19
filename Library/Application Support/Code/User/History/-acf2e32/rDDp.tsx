import { Dialog } from '@highlight-ui/dialog';
import { Body } from '@highlight-ui/typography';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type Requests } from '../../../api';
import { MICRO_FRONTEND_TRANSLATION_NAMESPACE } from '../../../application/config/constants';
import { trackIntegrationsOpenedConnectedIntegrationDetails } from '../../../shared/tracker';
import { CustomAccessRightsTab } from '../ViewIntegrationDetailsTabs/AccessRightsTab/CustomIntegrations/CustomAccessRightsTab';
import { ApiCredentialsTab } from '../ViewIntegrationDetailsTabs/ApiCredentialsTab/ApiCredentialsTab';
import { LoadingSkeleton as ApiCredentialsTabLoadingSkeleton } from '../ViewIntegrationDetailsTabs/ApiCredentialsTab/LoadingSkeleton/LoadingSkeleton';
import type { NewCredential } from '../types';
import styles from './ViewCustomIntegrationDrawer.module.scss';
import { ViewCustomIntegrationDrawerHeader } from './ViewCustomIntegrationDrawerHeader/ViewCustomIntegrationDrawerHeader';

type Props = {
  details: Requests['ConnectedCustomIntegration'];
  closeDrawer: () => void;
  attributesList: Requests['Attributes']['data'];
  legalEntitiesList: Requests['LegalEntities']['legalEntities'];
  requestNewCredential: (
    clientId: string,
    integrationDetails: Requests['APICredentialPostPayload'],
  ) => void;
  newCredential: NewCredential;
  isApiCredentialsTabLoadingState: boolean;
  isAccessRightsTabLoadingState: boolean;
  updateCustomIntegration: (updatedData: Requests['Auth']) => void;
  onChangeIntegrationData: (isDirty: boolean) => void;
  showDisconnectIntegrationDialog?: () => void;
};

export type DrawerTabs = 'API_CREDENTIAL' | 'ACCESS_RIGHTS';
export const ViewCustomIntegrationDrawer = ({
  details,
  closeDrawer,
  attributesList,
  legalEntitiesList,
  requestNewCredential,
  newCredential,
  isApiCredentialsTabLoadingState,
  isAccessRightsTabLoadingState,
  updateCustomIntegration,
  onChangeIntegrationData,
  showDisconnectIntegrationDialog,
}: Props) => {
  const { t } = useTranslation(MICRO_FRONTEND_TRANSLATION_NAMESPACE);
  const [currentTab, setCurrentTab] = useState<DrawerTabs>('ACCESS_RIGHTS');
  const [isDiscardProgressDialogOpen, setIsDiscardProgressDialogOpen] =
    useState<boolean>(false);
  const [isFormDirty, setIsFormDirty] = useState<boolean>(false);

  useEffect(
    () =>
      trackIntegrationsOpenedConnectedIntegrationDetails({
        integration_name: details.name,
        integration_type: '3P',
        connected_integration_details_view_tab_name: currentTab,
      }),
    [currentTab, details],
  );
  console.log('[]', attributesList);

  return (
    <div className={styles.container}>
      <ViewCustomIntegrationDrawerHeader
        isFormDirty={isFormDirty}
        closeDrawer={closeDrawer}
        details={details}
        setIsDiscardProgressDialogOpen={setIsDiscardProgressDialogOpen}
        showDisconnectIntegrationDialog={showDisconnectIntegrationDialog}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
      {currentTab === 'API_CREDENTIAL' ? (
        isApiCredentialsTabLoadingState ? (
          <ApiCredentialsTabLoadingSkeleton />
        ) : (
          <ApiCredentialsTab
            details={details}
            newCredential={newCredential}
            requestNewCredential={requestNewCredential}
          />
        )
      ) : (
        <CustomAccessRightsTab
          attributesList={attributesList}
          legalEntitiesList={legalEntitiesList}
          auth={
            newCredential
              ? {
                  clientId: newCredential.clientId,
                  scopes: newCredential.scopes,
                  allowedEmployeeAttributes: newCredential.allowedAttributes,
                  accessibleBy: {
                    legalEntities: newCredential.filters
                      ?.find(
                        (filter) =>
                          filter.name === 'legalEntities' ||
                          filter.name === 'legal_entity.id',
                      )
                      ?.value.map((id) => {
                        return {
                          id: id,
                        };
                      }),
                  } as Requests['Auth']['accessibleBy'],
                }
              : details.auth
          }
          isButtonLoadingState={isAccessRightsTabLoadingState}
          updateIntegration={updateCustomIntegration}
          isFormDirty={(isDirty: boolean) => {
            setIsFormDirty(isDirty);
            onChangeIntegrationData(isDirty);
          }}
          integrationName={details.name}
        />
      )}
      <Dialog
        variant="destructive"
        size="small"
        title={t('connected-integrations.dialog.discard-changes.title')}
        open={isDiscardProgressDialogOpen}
        metadata={{ testId: 'progress-lost-dialog' }}
        onRequestToClose={() => setIsDiscardProgressDialogOpen(false)}
        primaryButton={{
          buttonLabel: t(
            'connected-integrations.dialog.discard-changes.primary-button',
          ),
          onClick: () => {
            setIsDiscardProgressDialogOpen(false);
            setIsFormDirty(false);
            closeDrawer();
          },
        }}
        secondaryButtons={[
          {
            buttonLabel: t(
              'connected-integrations.dialog.discard-changes.secondary-button',
            ),
            onClick: () => setIsDiscardProgressDialogOpen(false),
          },
        ]}
      >
        <Body>
          {t('connected-integrations.dialog.discard-changes.description')}
        </Body>
      </Dialog>
    </div>
  );
};
