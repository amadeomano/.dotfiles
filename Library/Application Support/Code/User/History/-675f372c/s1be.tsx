import { configureRequest } from '@personio-web/request';
import { PageShell } from 'designSystem/component/page-shell';
import { Fragment, Suspense, type FC, type PropsWithChildren } from 'react';

import {
  isToggleFeatureFlagEnabled,
  useToggleFeatureFlag,
} from '@personio-web/use-feature-flag';
import dynamic from 'next/dynamic';
import { ErrorBoundary as PayrollErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { PersonioSpinner } from './components/PersonioSpinner/PersonioSpinner';
import { FeatureFlags } from './featureFlags';
import { useSelectActivePayrollIntegration } from './hooks/useSelectActivePayrollIntegration';
import { type PayrollIntegrationsType } from './integrations-hub';
import DatevLugCore from './integrations/datev-lug/DatevLugCore';
import DatevCore from './integrations/datev/DatevCore';
import LoketCore from './integrations/loket';
import PayrollGbPayrollCore from './integrations/payroll-gb';
import PreliminaryPayrollCore from './integrations/preliminary/PreliminaryPayrollCore';

export const IS_BROWSER = typeof window !== 'undefined';

export const API_BASE_URL: string = IS_BROWSER ? window.location.origin : '';

configureRequest({
  timeout: 300_000,
  baseURL: API_BASE_URL,
});

const HubExperienceLazy: Partial<
  Record<
    PayrollIntegrationsType,
    () => Promise<{ default: React.ComponentType }>
  >
> = {
  preliminary: () =>
    import('./integrations/preliminary/PreliminaryPayrollCore'),
  datev: () => import('./integrations/datev/DatevCore'),
  'datev-lug': () => import('./integrations/datev-lug/DatevLugCore'),
  gb: () => import('./integrations/payroll-gb'),
  loket: () => import('./integrations/loket'),
};

const HubExperience: Partial<
  Record<PayrollIntegrationsType, () => JSX.Element>
> = {
  preliminary: PreliminaryPayrollCore,
  datev: DatevCore,
  'datev-lug': DatevLugCore,
  gb: PayrollGbPayrollCore,
  loket: LoketCore,
};

// TODO: remove prop once all the payrolls are using PageHierarchical
type RootProps = { usesPageHierarchical: boolean };
const PayrollRoot: FC<PropsWithChildren<RootProps>> = ({
  children,
  usesPageHierarchical: usesPage,
}) => {
  const Base = usesPage ? Fragment : PageShell;
  return <Base>{children}</Base>;
};

export const PayrollHub = () => {
  console.log('[] PayrollHub begin');
  const { isContextLoading, currentIntegration } =
    useSelectActivePayrollIntegration();
  const isLazyLoadingEnabled = isToggleFeatureFlagEnabled(
    useToggleFeatureFlag(FeatureFlags.ENABLE_LAZY_LOADING),
  );

  if (isContextLoading) {
    return <PayrollLoadingHub />;
  }

  console.log('[] PayrollHub loaded');
  // if the context is loaded and there's no integration id, then, we are in the preliminary
  const integration = currentIntegration?.id || 'preliminary';

  if (isLazyLoadingEnabled) {
    const loadPayroll =
      HubExperienceLazy[integration as keyof typeof HubExperienceLazy];

    if (!loadPayroll) return null;

    const Payroll = dynamic(loadPayroll, { ssr: false });

    return (
      <PayrollErrorBoundary integrationType={integration}>
        <PayrollRoot usesPageHierarchical={integration === 'gb'}>
          <Suspense>
            <Payroll />
          </Suspense>
        </PayrollRoot>
      </PayrollErrorBoundary>
    );
  }

  const Payroll = HubExperience[integration as keyof typeof HubExperience];

  if (!Payroll) return null;

  return (
    <PayrollErrorBoundary integrationType={integration}>
      <PayrollRoot usesPageHierarchical={integration === 'gb'}>
        <Payroll />
      </PayrollRoot>
    </PayrollErrorBoundary>
  );
};

const PayrollLoadingHub = () => (
  <main
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
    }}
  >
    <PersonioSpinner loading />
  </main>
);
