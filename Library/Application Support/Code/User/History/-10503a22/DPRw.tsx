import { Drawer } from '@highlight-ui/drawer';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useNavigate } from 'react-router-dom';
import { type Requests } from '../../../api';
import { featureFlagsDictionary } from '../../../shared';
import { CreateCustomIntegrationDrawer } from '../CreateCustomIntegrationDrawer/CreateCustomIntegrationDrawer';
import CreateCustomIntegrationDrawerV2 from '../CreateCustomIntegrationDrawerV2/CreateCustomIntegrationDrawerV2';
import { FirstPartyIntegrationDetailsDrawer } from '../FirstPartyIntegrationDetailsDrawer/FirstPartyIntegrationDetailsDrawer';
import RecruitingIntegrationDrawer from '../RecruitingIntegrationDrawer/RecruitingIntegrationDrawer';
import ThirdPartyIntegrationDrawer from '../ThirdPartyIntegrationDrawer/ThirdPartyIntegrationDrawer';
import {
  isCustomIntegration,
  isFirstPartyIntegration,
  isRecruitingIntegration,
  isThirdPartyIntegration,
  type MaybeSelectedIntegration,
  type NewCredential,
} from '../types';
import { ViewCustomIntegrationDrawer } from '../ViewCustomIntegrationDrawer/ViewCustomIntegrationDrawer';

type ConnectedIntegrationDrawersProps = {
  isOpen: boolean;
  integrationType?: string;
  selectedIntegration: MaybeSelectedIntegration;
  setSelectedIntegration: (integration: MaybeSelectedIntegration) => void;
  attributesData?: Requests['Attributes']['data'];
  legalEntitiesData?: Requests['LegalEntities'];
  scopesData?: Requests['APICredentialScopesResponse']['data'];
  newCredential: NewCredential;
  onDrawerClose: () => void;
  onGenerateNewCredential: (
    details: Requests['APICredentialPostPayload'],
  ) => Promise<void>;
  onUpdateCredential: (
    updatedData: Requests['Auth'],
  ) => Promise<Requests['APICredentialResponse']['data']>;
  isDrawerCloseable: boolean;
  setIsDrawerCloseable: (closeable: boolean) => void;
  onRequestNewCredential: (
    clientId: string,
    details: Requests['APICredentialPostPayload'],
  ) => Promise<void>;
  onRefetchData: () => void;
  onDisconnectIntegration: () => void;
  isCreateCredentialLoadingState: boolean;
  isUpdateCredentialLoadingState: boolean;
  isCreateCustomIntegrationsDrawerOpen: boolean;
  setCreateCustomIntegrationsDrawerOpen: (isOpen: boolean) => void;
};

const ConnectedIntegrationDrawers = ({
  isOpen,
  integrationType,
  selectedIntegration,
  attributesData,
  legalEntitiesData,
  newCredential,
  onDrawerClose,
  onGenerateNewCredential,
  onUpdateCredential,
  isDrawerCloseable,
  setIsDrawerCloseable,
  onRequestNewCredential,
  onRefetchData,
  onDisconnectIntegration,
  isCreateCredentialLoadingState,
  isUpdateCredentialLoadingState,
  setSelectedIntegration,
  isCreateCustomIntegrationsDrawerOpen,
  scopesData,
  setCreateCustomIntegrationsDrawerOpen,
}: ConnectedIntegrationDrawersProps) => {
  const navigate = useNavigate();

  const { isReady, isOn } = useFeatureFlag(
    featureFlagsDictionary.GranularScopes,
  );

  const isGranularScopesOn = isReady && isOn;

  return (
    <Drawer
      metadata={{ testId: 'connected-integration-drawer' }}
      visible={isOpen || integrationType !== undefined}
      onClose={onDrawerClose}
      leftOffset="calc(100% - 940px)"
      enableBackdrop
      onBackdropClick={() => isDrawerCloseable && navigate('')}
    >
      {isRecruitingIntegration(selectedIntegration) ? (
        <RecruitingIntegrationDrawer
          recruitingToken={selectedIntegration.token}
          closeRecruitingDrawer={onDrawerClose}
        />
      ) : isCustomIntegration(selectedIntegration) &&
        attributesData &&
        legalEntitiesData?.legalEntities ? (
        <ViewCustomIntegrationDrawer
          details={selectedIntegration}
          closeDrawer={onDrawerClose}
          attributesList={attributesData}
          requestNewCredential={onRequestNewCredential}
          newCredential={newCredential}
          isApiCredentialsTabLoadingState={isCreateCredentialLoadingState}
          isAccessRightsTabLoadingState={isUpdateCredentialLoadingState}
          updateCustomIntegration={async (updatedData) => {
            const updateCredentialResponse = await onUpdateCredential(
              updatedData,
            );
            onRefetchData();
            setSelectedIntegration({
              ...selectedIntegration,
              auth: {
                ...selectedIntegration.auth,
                scopes: updateCredentialResponse.scopes,
                allowedEmployeeAttributes:
                  updateCredentialResponse.allowedAttributes,
                accessibleBy: {
                  legalEntities: updateCredentialResponse.filters
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
              },
            });
          }}
          onChangeIntegrationData={(isDirty) => setIsDrawerCloseable(!isDirty)}
          showDisconnectIntegrationDialog={onDisconnectIntegration}
          legalEntitiesList={legalEntitiesData.legalEntities}
        />
      ) : isThirdPartyIntegration(selectedIntegration) && attributesData ? (
        <ThirdPartyIntegrationDrawer
          details={selectedIntegration}
          closeDrawer={onDrawerClose}
          attributesList={attributesData}
          requestNewCredential={onRequestNewCredential}
          newCredential={newCredential}
          isApiCredentialsTabLoadingState={isCreateCredentialLoadingState}
          isAccessRightsTabLoadingState={isUpdateCredentialLoadingState}
          update3PIntegration={async (updatedData) => {
            const updateCredentialResponse = await onUpdateCredential(
              updatedData,
            );
            onRefetchData();
            setSelectedIntegration({
              ...selectedIntegration,
              auth: {
                ...selectedIntegration.auth,
                scopes: updateCredentialResponse.scopes,
                allowedEmployeeAttributes:
                  updateCredentialResponse.allowedAttributes,
                accessibleBy: {
                  legalEntities: updateCredentialResponse.filters
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
              },
            });
          }}
          onChangeIntegrationData={(isDirty) => setIsDrawerCloseable(!isDirty)}
          showDisconnectIntegrationDialog={onDisconnectIntegration}
        />
      ) : isFirstPartyIntegration(selectedIntegration) ? (
        <FirstPartyIntegrationDetailsDrawer
          integrationId={selectedIntegration.id}
          integrationStatus={
            selectedIntegration.integrationStatus.kind === 'CONNECTED'
              ? 'CONNECTED'
              : 'DEACTIVATED'
          }
          refetchConnectedIntegrationsData={onRefetchData}
          closeDetailsDrawer={onDrawerClose}
          showDisconnectIntegrationDialog={onDisconnectIntegration}
        />
      ) : isCreateCustomIntegrationsDrawerOpen ? (
        isGranularScopesOn ? (
          <CreateCustomIntegrationDrawerV2
            closeDrawer={() => {
              onDrawerClose();
              setCreateCustomIntegrationsDrawerOpen(false);
            }}
          />
        ) : (
          <CreateCustomIntegrationDrawer
            onClose={() => {
              onDrawerClose();
              setCreateCustomIntegrationsDrawerOpen(false);
            }}
            generateNewCredential={onGenerateNewCredential}
            newCredential={newCredential}
            isCreateIntegrationButtonLoading={isCreateCredentialLoadingState}
            scopesData={scopesData}
            attributesData={attributesData}
            legalEntitiesData={legalEntitiesData?.legalEntities}
          />
        )
      ) : null}
    </Drawer>
  );
};

export default ConnectedIntegrationDrawers;
