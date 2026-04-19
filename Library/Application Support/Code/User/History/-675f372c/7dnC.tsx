import { configureRequest } from '@personio-web/request';
import { PageShell } from 'designSystem/component/page-shell';
import {
  Fragment,
  Suspense,
  memo,
  type FC,
  type PropsWithChildren,
} from 'react';

import { ErrorBoundary as PayrollErrorBoundary } from '@personio-web/payroll-component-error-boundary';
import dynamic from 'next/dynamic';
import { PersonioSpinner } from './components/PersonioSpinner/PersonioSpinner';
import { useSelectActivePayrollIntegration } from './hooks/useSelectActivePayrollIntegration';
import { type PayrollIntegrationsType } from './integrations-hub';

export const IS_BROWSER = typeof window !== 'undefined';

export const API_BASE_URL: string = IS_BROWSER ? window.location.origin : '';

configureRequest({
  timeout: 300_000,
  baseURL: API_BASE_URL,
});

const HubExperience: Partial<
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
  addison: () => import('./integrations/export/Addison'),
  'adp-spain': () => import('./integrations/export/ADPPartner'),
  paisy: () => import('./integrations/export/ADPPaisy'),
  'sage50-payroll': () => import('./integrations/export/Sage50'),
  bmd: () => import('./integrations/export/BMD'),
  a3: () => import('./integrations/preliminary/PreliminaryPayrollCore'),
  xero: () => import('./integrations/preliminary/PreliminaryPayrollCore'),
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

const PayrollHubLoader: FC<{
  loader: () => Promise<{ default: React.ComponentType }>;
  integration: keyof typeof HubExperience;
}> = memo(({ loader, integration }) => {
  const Payroll = dynamic(loader, { ssr: false });

  return (
    <PayrollErrorBoundary boundaryId={`${integration}-payroll`}>
      <PayrollRoot usesPageHierarchical={['loket'].includes(integration)}>
        <Suspense>
          <Payroll />
        </Suspense>
      </PayrollRoot>
    </PayrollErrorBoundary>
  );
});

export const PayrollHub = () => {
  const { isContextLoading, currentIntegration } =
    useSelectActivePayrollIntegration();

  if (isContextLoading) {
    return <PayrollLoadingHub />;
  }

  // if the context is loaded and there's no integration id, then, we are in the preliminary
  const integration = currentIntegration?.id || 'preliminary';

  const loader = HubExperience[integration as keyof typeof HubExperience];

  if (!loader) return null;

  return <PayrollHubLoader loader={loader} integration={integration} />;
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
