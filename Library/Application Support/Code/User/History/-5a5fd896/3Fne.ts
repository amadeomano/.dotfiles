import { useEffect, useMemo } from 'react';

import { useRouter } from 'next/router';

import {
  useGetPayrollContextSettings,
  useGetPayrollIntegrations,
} from '@personio-web/payroll-data-preliminary-payroll';
import { extractCurrentPayrollRoute } from '../utils';

const redirect = (url: string) => {
  const newWindow = window.open(url, '_self', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};

/**
 * This hook has the goal to consume the context endpoint to identify if the current companyId
 * contains an integration enabled and based on the current route redirect the user to the new or legacy
 * Preliminary Payroll version.
 *
 */
export const useRedirectForActiveIntegrations = () => {
  const { data: contextData, isLoading: isLoadingPayrollContext } =
    useGetPayrollContextSettings();
  const { data: integrationData, isLoading: isLoadingPayrollIntegrations } =
    useGetPayrollIntegrations();
  const { asPath } = useRouter();
  const currentRoute = extractCurrentPayrollRoute(asPath, '');
  const hasSetSlug = !!currentRoute;
  const contextIntegration = contextData?.data?.integrations || [];
  const payrollIntegrations = integrationData?.data?.integrations || [];
  const hasContextIntegrations = contextIntegration.length > 0;
  const hasPayrollIntegrations = payrollIntegrations.some(
    (integration) => integration.enabled,
  );
  const hasIntegrationsEnabled =
    hasContextIntegrations || hasPayrollIntegrations;

  useEffect(
    // redirect the user if the company has an integration enabled and not setSlug
    function redirectToLegacyPreliminary() {
      if (hasIntegrationsEnabled && !hasSetSlug) {
        redirect('/payroll/verification');
      }
    },
    [hasIntegrationsEnabled, hasSetSlug],
  );

  const isContextLoading = useMemo(
    () =>
      (!hasSetSlug &&
        isLoadingPayrollContext &&
        isLoadingPayrollIntegrations) ||
      hasIntegrationsEnabled,
    [
      hasSetSlug,
      isLoadingPayrollContext,
      hasIntegrationsEnabled,
      isLoadingPayrollIntegrations,
    ],
  );
  return { isContextLoading };
};
