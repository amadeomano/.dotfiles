import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import {
  useGetPayrollContextSettings,
  useGetPayrollIntegrations,
} from '@personio-web/payroll-data-preliminary-payroll';
import { extractCurrentPayrollRoute } from '../utils';
import {
  isToggleFeatureFlagEnabled,
  useToggleFeatureFlag,
} from '@personio-web/use-feature-flag';
import { type ParsedUrlQuery } from 'querystring';
import {
  type NormalizedIntegration,
  PayrollIntegrationByFF,
  PayrollIntegrations,
} from '../integrations-hub';

const redirect = (url: string) => {
  const newWindow = window.open(url, '_self', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

const normalizeContextData = (contextIntegrations: string[]) => {
  const normalizedIntegrations = contextIntegrations
    .map((integration) => {
      const isIntegration = PayrollIntegrations.includes(integration as any);
      if (isIntegration) {
        return {
          id: integration,
          enabled: true,
        };
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
  query: ParsedUrlQuery,
): NormalizedIntegration[] => {
  const contextData = normalizeContextData(contextIntegrations);
  const integrationData = normalizeIntegrationData(integrations);

  // for gb integration, we don't have an api and rely on URL
  const hasGbHub = query?.hub === 'gb';
  const gbNormalizedData = {
    id: 'gb',
    enabled: hasGbHub,
  };

  const payrollIntegrations = [
    ...contextData,
    ...integrationData,
    gbNormalizedData,
  ];

  console.log('[P4]', payrollIntegrations);
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
  const { data: integrationData, isLoading: isLoadingPayrollIntegrations } =
    useGetPayrollIntegrations();
  console.log('[P3]', { contextData, integrationData });
  const { asPath, query } = useRouter();
  const currentRoute = extractCurrentPayrollRoute(asPath, '');
  const hasSetSlug = !!currentRoute;
  const contextIntegration = contextData?.data?.integrations || [];
  const payrollIntegrations = integrationData?.data?.integrations || [];

  const isLoadingResource =
    isLoadingPayrollContext || isLoadingPayrollIntegrations;

  const rawIntegration = determineCurrentPayrollIntegration(
    contextIntegration,
    payrollIntegrations,
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
    useToggleFeatureFlag(String(featureFlag)),
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

const determineCurrentPayrollIntegration = (
  contextIntegrations: string[],
  integrations: { displayName: string; enabled: boolean; name: string }[],
  query: ParsedUrlQuery,
) => {
  const normalizedIntegrations = normalizePayrollDataIntegration(
    contextIntegrations,
    integrations,
    query,
  );
  return normalizedIntegrations.find((integration) => integration.enabled);
};
