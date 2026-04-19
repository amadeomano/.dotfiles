import { Button } from '@highlight-ui/button';
import { Dialog } from '@highlight-ui/dialog';
import { Body } from '@highlight-ui/typography';
import { useAuthContext } from '@personio-web/auth-context';
import { PageShell } from '@personio-web/page-shell';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { type Requests } from '../../api';
import { MICRO_FRONTEND_TRANSLATION_NAMESPACE } from '../../application/config/constants';
import { featureFlagsDictionary } from '../../shared';
import {
  trackIntegrationsStartedCustomIntegration,
  trackIntegrationsUpdatedConnection,
} from '../../shared/tracker';
import { useDeleteCredential } from '../Wizard/hooks/queries/useDeleteCredential';
import { usePostCredential } from '../Wizard/hooks/queries/usePostCredential';
import { useDisableCredential } from '../hooks/queries/useDisableCredential';
import { useGetAdditionalMetaInfo } from '../hooks/queries/useGetAdditionalMetaInfo';
import { useGetAllowedAttributes } from '../hooks/queries/useGetAllowedAttributes';
import { useGetConnectedIntegrations } from '../hooks/queries/useGetConnectedIntegrations';
import { useGetLegalEntities } from '../hooks/queries/useGetLegalEntities';
import { useGetScopes } from '../hooks/queries/useGetScopes';
import { usePatchCredential } from '../hooks/queries/usePatchCredential';
import { useRemoveIntegration } from '../hooks/queries/useRemoveIntegration';
import ConnectedIntegrationDrawers from './ConnectedIntegrationDrawers/ConnectedIntegrationDrawers';
import styles from './ConnectedIntegrations.module.scss';
import {
  type ConnectedIntegrationTableState,
  ConnectedIntegrationsTable,
} from './ConnectedIntegrationsTable/ConnectedIntegrationsTable';
import { findConnectedIntegrationBy } from './findConnectedIntegrationBy';
import { getConnectedIntegrationsTableState } from './getConnectedIntegrationsTableState';
import {
  type MaybeSelectedIntegration,
  type NewCredential,
  type SelectedConnectedIntegrationParams,
  isCustomIntegration,
  isFirstPartyIntegration,
  isRecruitingIntegration,
  isThirdPartyIntegration,
} from './types';

const ConnectedIntegrations = () => {
  const { t } = useTranslation(MICRO_FRONTEND_TRANSLATION_NAMESPACE);

  const navigate = useNavigate();
  const { integrationType, id } =
    useParams<SelectedConnectedIntegrationParams>();

  const { isOn: isAthenaFFOn, isReady: isAthenaFFReady } = useFeatureFlag(
    featureFlagsDictionary.AthenaGatewayPath,
  );
  const isAthenaGatewayEnabled = isAthenaFFOn && isAthenaFFReady;

  const { companyId } = useAuthContext();

  const [selectedIntegration, setSelectedIntegration] =
    useState<MaybeSelectedIntegration>(null);
  const [isDrawerCloseable, setIsDrawerCloseable] = useState<boolean>(true);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [
    isChangeCredentialActivationDialogOpen,
    setIsChangeCredentialActivationDialogOpen,
  ] = useState<boolean>(false);
  const [
    isCreateCustomIntegrationsDrawerOpen,
    setCreateCustomIntegrationsDrawerOpen,
  ] = useState<boolean>(false);
  const [newCredential, setNewCredential] = useState<NewCredential>(null);
  console.log('[] ConnectedIntegrations', newCredential);

  const { data: attributesData, status: attributesStatus } =
    useGetAllowedAttributes(isAthenaGatewayEnabled, isAthenaFFReady);
  const { data: scopesData, status: scopesStatus } = useGetScopes(
    isAthenaGatewayEnabled,
    isAthenaFFReady,
  );
  const { data: metaInfo, status: metaInfoStatus } = useGetAdditionalMetaInfo(
    isAthenaGatewayEnabled,
    isAthenaFFReady,
  );
  const { data: legalEntitiesData, status: legalEntitiesStatus } =
    useGetLegalEntities(companyId);

  const {
    data: connectedIntegrationsData,
    refetch: refetchConnectedIntegrationData,
    status: connectedIntegrationsStatus,
  } = useGetConnectedIntegrations(isAthenaGatewayEnabled, isAthenaFFReady);

  const { onDeleteCredential, status: deleteCredentialStatus } =
    useDeleteCredential(isAthenaGatewayEnabled, selectedIntegration?.name);
  const {
    removeIntegration: disconnectFirstPartyIntegration,
    status: disconnectFirstPartyIntegrationStatus,
  } = useRemoveIntegration(
    {
      integrationType: 'COMPANY',
      partner:
        selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION'
          ? selectedIntegration?.partner ?? 'TRAY'
          : 'TRAY',
      instanceId:
        selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION' &&
        selectedIntegration.integrationStatus.kind !== 'EMPTY'
          ? selectedIntegration.integrationStatus.instanceId
          : '',
      name: selectedIntegration?.name,
    },
    isAthenaGatewayEnabled,
  );

  const { onAddCredential, status: onAddCredentialStatus } = usePostCredential(
    isAthenaGatewayEnabled,
  );

  const generateNewCredential = async (
    integrationDetails: Requests['APICredentialPostPayload'],
  ) => {
    const addCredentialResponse = await onAddCredential({
      name: integrationDetails.name,
      integration: integrationDetails.integration,
      integrationId: integrationDetails.integrationId,
      scopes: integrationDetails.scopes,
      allowedAttributes: integrationDetails.allowedAttributes,
      filters: integrationDetails.filters,
    });
    setNewCredential({
      name: addCredentialResponse.name,
      clientId: addCredentialResponse.clientId,
      clientSecret: addCredentialResponse.clientSecret,
      scopes: addCredentialResponse.scopes,
      allowedAttributes: addCredentialResponse.allowedAttributes,
      filters: addCredentialResponse.filters,
    });
    refetchConnectedIntegrationData();
  };

  const requestNewCredential = async (
    clientId: string,
    integrationDetails: Requests['APICredentialPostPayload'],
  ) => {
    await onDeleteCredential({ clientId });
    await generateNewCredential(integrationDetails);
  };
  const { onUpdateCredential, status: onUpdateCredentialStatus } =
    usePatchCredential(isAthenaGatewayEnabled);

  const { onShouldDisableCredential } = useDisableCredential(
    isAthenaGatewayEnabled,
  );

  function isNotStateError(value: ConnectedIntegrationTableState): boolean {
    return !('kind' in value && value['kind'] === 'ERROR');
  }

  const connectedIntegrationTableState: ConnectedIntegrationTableState =
    getConnectedIntegrationsTableState({
      connectedIntegrationsData,
      connectedIntegrationsStatus,
      legalEntitiesData,
      legalEntitiesStatus,
      metaInfoStatus,
      scopesData,
      scopesStatus,
      attributesData,
      attributesStatus,
      metaInfoData: metaInfo,
    });

  useEffect(() => {
    if (newCredential) {
      return;
    } else if (integrationType === undefined) {
      setSelectedIntegration(null);
    } else {
      const selectedConnectedIntegration = findConnectedIntegrationBy(
        connectedIntegrationsData?._data,
        integrationType,
        id,
      );
      setSelectedIntegration(selectedConnectedIntegration || null);
    }
  }, [id, integrationType, connectedIntegrationsData, newCredential]);

  return (
    <div
      data-test-id="connected-integrations"
      className={styles.connectedIntegrationWrapper}
    >
      <PageShell
        title={
          <PageShell.Title
            title={t('shared.header.connected-integration.title')}
          />
        }
        subtitle={
          <PageShell.Subtitle
            subtitle={t('shared.header.connected-integration.subtitle')}
          />
        }
        isLoading={
          connectedIntegrationsStatus === 'loading' ||
          metaInfoStatus === 'loading'
        }
        {...(metaInfo?._meta.canCreateCustomIntegration &&
        isNotStateError(connectedIntegrationTableState)
          ? {
              primaryActions: (
                <PageShell.PrimaryActions>
                  <Button
                    variant="emphasized"
                    onClick={() => {
                      setCreateCustomIntegrationsDrawerOpen(true);
                      trackIntegrationsStartedCustomIntegration();
                    }}
                  >
                    {t(
                      'shared.header.connected-integration.create-custom-integration-button',
                    )}
                  </Button>
                </PageShell.PrimaryActions>
              ),
            }
          : {})}
      >
        <PageShell.Layout>
          <ConnectedIntegrationsTable
            connectedIntegrationsState={connectedIntegrationTableState}
            showDisconnectIntegrationDialog={(
              integration: MaybeSelectedIntegration,
            ) => {
              setSelectedIntegration(integration);
              setIsRemoveDialogOpen(true);
            }}
            showDisableIntegrationDialog={(
              integration: MaybeSelectedIntegration,
            ) => {
              setSelectedIntegration(integration);
              setIsChangeCredentialActivationDialogOpen(true);
            }}
            openDetailDrawer={(integration) => {
              if (isFirstPartyIntegration(integration)) {
                setIsDrawerCloseable(false);
                navigate(`integration/${integration.id}`);
              } else if (isThirdPartyIntegration(integration)) {
                setIsDrawerCloseable(true);
                navigate(`integration/${integration.id}`);
              } else if (isCustomIntegration(integration)) {
                setIsDrawerCloseable(true);
                navigate(`custom-integration/${integration.auth.clientId}`);
              } else if (isRecruitingIntegration(integration)) {
                setIsDrawerCloseable(true);
                navigate('recruiting-integration');
              }
            }}
            onEnableCredentialAction={async (clientID: string) => {
              await onShouldDisableCredential({
                clientId: clientID,
                isEnabled: true,
              });
              await refetchConnectedIntegrationData();
              navigate('');
            }}
          />
        </PageShell.Layout>
      </PageShell>
      <ConnectedIntegrationDrawers
        isOpen={
          isCreateCustomIntegrationsDrawerOpen || integrationType !== undefined
        }
        integrationType={integrationType}
        selectedIntegration={selectedIntegration}
        attributesData={attributesData}
        legalEntitiesData={legalEntitiesData}
        scopesData={scopesData}
        newCredential={newCredential}
        onDrawerClose={() => {
          setNewCredential(null);
          setIsDrawerCloseable(true);
          navigate('');
        }}
        onGenerateNewCredential={generateNewCredential}
        onUpdateCredential={onUpdateCredential}
        isDrawerCloseable={isDrawerCloseable}
        setIsDrawerCloseable={setIsDrawerCloseable}
        onRequestNewCredential={requestNewCredential}
        onRefetchData={refetchConnectedIntegrationData}
        onDisconnectIntegration={() => setIsRemoveDialogOpen(true)}
        isCreateCredentialLoadingState={onAddCredentialStatus === 'loading'}
        isUpdateCredentialLoadingState={onUpdateCredentialStatus === 'loading'}
        setCreateCustomIntegrationsDrawerOpen={
          setCreateCustomIntegrationsDrawerOpen
        }
        isCreateCustomIntegrationsDrawerOpen={
          isCreateCustomIntegrationsDrawerOpen
        }
        setSelectedIntegration={setSelectedIntegration}
      />

      <Dialog
        metadata={{ testId: 'disconnect-dialog' }}
        title={t('connected-integrations.dialog.disconnect-integration.title')}
        open={isRemoveDialogOpen}
        onRequestToClose={() => {
          navigate('');
          setIsRemoveDialogOpen(false);
        }}
        primaryButton={{
          buttonLabel: t(
            'connected-integrations.dialog.disconnect-integration.disconnect-button',
          ),
          onClick: async () => {
            if (selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION') {
              await disconnectFirstPartyIntegration();
            } else if (
              selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION' ||
              selectedIntegration?.kind === 'CUSTOM_INTEGRATION'
            ) {
              await onDeleteCredential({
                clientId: selectedIntegration.auth.clientId,
              });
            }
            await refetchConnectedIntegrationData();
            setIsRemoveDialogOpen(false);
            trackIntegrationsUpdatedConnection({
              integration_id:
                selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION' ||
                selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION'
                  ? selectedIntegration?.id
                  : undefined,
              integration_slug:
                selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION' ||
                selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION'
                  ? selectedIntegration?.slug
                  : undefined,
              integration_type:
                selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION'
                  ? '1P'
                  : selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION'
                  ? '3P'
                  : 'custom',
              integration_name:
                selectedIntegration?.name ?? 'missing integration name',
              connected_integration_action_origin: 'CONFIRMATION_DIALOG',
              connected_integration_connection_action: 'DISCONNECT',
            });
            navigate('');
          },
          buttonState:
            connectedIntegrationsStatus === 'loading' ||
            disconnectFirstPartyIntegrationStatus === 'loading' ||
            deleteCredentialStatus === 'loading'
              ? 'loading'
              : 'default',
        }}
        secondaryButtons={[
          {
            buttonLabel: t('shared.cancel'),
            onClick: () => setIsRemoveDialogOpen(false),
            buttonState:
              connectedIntegrationsStatus === 'loading' ||
              disconnectFirstPartyIntegrationStatus === 'loading' ||
              deleteCredentialStatus === 'loading'
                ? 'loading'
                : 'default',
          },
        ]}
        size="small"
        variant="destructive"
      >
        <Body variant="base" as="span">
          {t(
            'connected-integrations.dialog.disconnect-integration.description',
            {
              integrationName: selectedIntegration?.name,
            },
          )}
        </Body>
      </Dialog>
      <Dialog
        metadata={{ testId: 'disable-dialog' }}
        title={t('connected-integrations.dialog.disable-integration.title')}
        open={isChangeCredentialActivationDialogOpen}
        onRequestToClose={() => {
          navigate('');
          setIsChangeCredentialActivationDialogOpen(false);
        }}
        primaryButton={{
          buttonLabel: t(
            'connected-integrations.dialog.disable-integration.disable-button',
          ),
          onClick: async () => {
            if (
              selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION' ||
              selectedIntegration?.kind === 'CUSTOM_INTEGRATION'
            ) {
              await onShouldDisableCredential({
                clientId: selectedIntegration?.auth?.clientId,
                isEnabled: false,
              });
            }
            await refetchConnectedIntegrationData();
            trackIntegrationsUpdatedConnection({
              integration_id:
                selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION' ||
                selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION'
                  ? selectedIntegration?.id
                  : undefined,
              integration_slug:
                selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION' ||
                selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION'
                  ? selectedIntegration?.slug
                  : undefined,
              integration_type:
                selectedIntegration?.kind === 'FIRST_PARTY_INTEGRATION'
                  ? '1P'
                  : selectedIntegration?.kind === 'THIRD_PARTY_INTEGRATION'
                  ? '3P'
                  : 'custom',
              integration_name:
                selectedIntegration?.name ?? 'missing integration name',
              connected_integration_action_origin: 'CONFIRMATION_DIALOG',
              connected_integration_connection_action: 'DISABLE',
            });
            setIsChangeCredentialActivationDialogOpen(false);
            navigate('');
          },
        }}
        secondaryButtons={[
          {
            buttonLabel: t('shared.cancel'),
            onClick: () => setIsChangeCredentialActivationDialogOpen(false),
          },
        ]}
        size="small"
        variant="destructive"
      >
        <Body variant="base" as="span">
          {t('connected-integrations.dialog.disable-integration.description')}
        </Body>
      </Dialog>
    </div>
  );
};

export default ConnectedIntegrations;
