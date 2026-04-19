import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import {
  useGetPayrollContextSettings,
  useGetPayrollIntegrations,
} from '@personio-web/payroll-data-preliminary-payroll';
import {
  isToggleFeatureFlagEnabled,
  useToggleFeatureFlag,
} from '@personio-web/use-feature-flag';
import { type ParsedUrlQuery } from 'querystring';
import { type FeatureFlag } from '../../../../../../featureFlags';
import {
  PayrollIntegrationByFF,
  type NormalizedIntegration,
} from '../integrations-hub';
import { extractCurrentPayrollRoute } from '../utils';

const redirect = (url: string) => {
  const newWindow = window.open(url, '_self', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

const normalizeContextData = (
  contextIntegrations: string[],
  contextIntegrationsLegalEntities: {
    datev?: string[];
    'datev-lug'?: string[];
  },
  legalEntity?: string,
) => {
  const normalizedIntegrations = contextIntegrations
    .map((integration) => {
      const isIntegration = ['datev', 'datev-lug'].includes(integration as any);

      if (isIntegration) {
        const integrationLegalEntities =
          contextIntegrationsLegalEntities[
            integration as 'datev' | 'datev-lug'
          ];
        const integrationBelongsToLegalEntity =
          !legalEntity ||
          !integrationLegalEntities ||
          integrationLegalEntities.length === 0 ||
          integrationLegalEntities.includes(legalEntity as string);

        if (integrationBelongsToLegalEntity) {
          return {
            id: integration,
            enabled: true,
          };
        }
      }
    })
    .filter((value) => !!value);

  return normalizedIntegrations;
};

const normalizeIntegrationData = (
  integrations: { displayName: string; enabled: boolean; name: string }[],
) => {
  return integrations.map((integration) => ({
    id: integration.name,
    enabled: integration.enabled,
  }));
};

export const normalizePayrollDataIntegration = (
  contextIntegrations: string[],
  integrations: { displayName: string; enabled: boolean; name: string }[],
  contextIntegrationsLegalEntities: {
    datev?: string[];
    'datev-lug'?: string[];
  },
  query: ParsedUrlQuery,
): NormalizedIntegration[] => {
  const contextData = normalizeContextData(
    contextIntegrations,
    contextIntegrationsLegalEntities,
    query.legalEntity as string | undefined,
  );
  const integrationData = normalizeIntegrationData(integrations);

  const payrollIntegrations = [...contextData, ...integrationData];

  const hasAnyIntegrationEnabled = payrollIntegrations.some(
    (int) => int?.enabled,
  );

  const preliminaryNormalizedData = {
    id: 'preliminary',
    enabled: !hasAnyIntegrationEnabled,
  };

  return [
    preliminaryNormalizedData,
    ...payrollIntegrations,
  ] as NormalizedIntegration[];
};

/**
 * This hook has the goal to consume the context endpoint to identify if the current companyId
 * contains an integration enabled and based on the current route redirect the user to the new or legacy
 * Preliminary Payroll version.
 *
 */
export const useSelectActivePayrollIntegration = () => {
  const { data: contextData, isLoading: isLoadingPayrollContext } =
    useGetPayrollContextSettings();
  const { asPath, query } = useRouter();
  const { data: integrationData, isLoading: isLoadingPayrollIntegrations } =
    useGetPayrollIntegrations(
      { enabled: !!query.legalEntity },
      {
        params: {
          enabled_only: true,
        },
      },
    );
  const currentRoute = extractCurrentPayrollRoute(asPath, '');
  const hasSetSlug = !!currentRoute;
  const contextIntegration = contextData?.data?.integrations || [];
  const payrollIntegrations = (
    integrationData?.data?.integrations || []
  ).filter((int) => !['datev-lodas', 'datev-lug'].includes(int.name));
  const integrationsByLegalEntity = assignPayrollIntegrationToLegalEntity(
    payrollIntegrations,
    query.legalEntity as string | undefined,
  );
  const contextIntegrationsLegalEntityIds =
    contextData?.data?.legalEntityIntegrations || {};

  const isLoadingResource =
    isLoadingPayrollContext || isLoadingPayrollIntegrations;

  const rawIntegration = determineCurrentPayrollIntegration(
    contextIntegration,
    integrationsByLegalEntity,
    contextIntegrationsLegalEntityIds,
    query,
  );

  const isCurrentIntegrationEnabled = useIsPayrollIntegrationO11(
    rawIntegration,
    isLoadingResource,
  );

  const currentIntegration = useHydrateCurrentIntegrationWithSplit(
    rawIntegration,
    isLoadingResource,
  );

  const redirectState = computeRedirectState(
    isCurrentIntegrationEnabled,
    isLoadingResource,
    hasSetSlug,
    currentIntegration,
  );

  useEffect(
    // redirect the user if the company has an integration enabled and not setSlug
    function redirectToLegacyPreliminary() {
      if (redirectState.shouldRedirect) {
        redirect('/payroll/verification');
      }
    },
    [redirectState.shouldRedirect],
  );

  const isContextLoading = useMemo(
    () => redirectState.isContextLoading,
    [redirectState.isContextLoading],
  );

  return {
    isContextLoading,
    shouldRedirect: redirectState.shouldRedirect,
    currentIntegration,
  };
};

export const computeRedirectState = (
  isCurrentIntegrationEnabled: boolean,
  isLoadingResource: boolean,
  hasSetSlug: boolean,
  currentIntegration?: NormalizedIntegration,
) => {
  const shouldRedirect =
    !hasSetSlug && // if there's no slug
    !isCurrentIntegrationEnabled && // if the FF for this integration is off OR
    !isLoadingResource && // if the resources it's already loaded
    currentIntegration !== undefined && // if there's no integration enabled
    !currentIntegration.enabled; // if the payroll isnt enabled after hydrationw with FF

  const isContextLoading =
    isLoadingResource ||
    (!hasSetSlug && isLoadingResource) ||
    (!isLoadingResource &&
      !currentIntegration?.enabled &&
      currentIntegration?.id) ||
    false;

  return { shouldRedirect, isContextLoading: Boolean(isContextLoading) };
};

const useIsPayrollIntegrationO11 = (
  currentIntegration?: NormalizedIntegration,
  isLoadingResource?: boolean,
) => {
  const featureFlag =
    PayrollIntegrationByFF[currentIntegration?.id || 'preliminary'];
  const isCurrentIntegrationEnabled = isToggleFeatureFlagEnabled(
    useToggleFeatureFlag(String(featureFlag) as FeatureFlag),
  );

  return typeof featureFlag === 'boolean' && !isLoadingResource
    ? featureFlag
    : isCurrentIntegrationEnabled;
};

/**
 * This hook hydrate the current integration with the value from FF
 */
export const useHydrateCurrentIntegrationWithSplit = (
  currentIntegration?: NormalizedIntegration,
  isLoadingResource?: boolean,
) => {
  const isPayrollIntegrationEnabled = useIsPayrollIntegrationO11(
    currentIntegration,
    isLoadingResource,
  );

  if (!currentIntegration) return currentIntegration;

  return {
    ...currentIntegration,
    enabled: currentIntegration ? isPayrollIntegrationEnabled : false,
  };
};

export const determineCurrentPayrollIntegration = (
  contextIntegrations: string[],
  integrations: { displayName: string; enabled: boolean; name: string }[],
  contextIntegrationsLegalEntities: {
    datev?: string[];
    'datev-lug'?: string[];
  },
  query: ParsedUrlQuery,
) => {
  const normalizedIntegrations = normalizePayrollDataIntegration(
    contextIntegrations,
    integrations,
    contextIntegrationsLegalEntities,
    query,
  );
  return normalizedIntegrations.find((integration) => integration.enabled);
};

export const assignPayrollIntegrationToLegalEntity = (
  companyPayrollIntegrations: {
    displayName: string;
    enabled: boolean;
    name: string;
    legalEntityIds: string[];
  }[],
  legalEntityId: string | undefined,
) =>
  companyPayrollIntegrations.filter(
    (int) =>
      int.legalEntityIds.length === 0 ||
      legalEntityId === undefined ||
      int.legalEntityIds.includes(legalEntityId as string),
  );
