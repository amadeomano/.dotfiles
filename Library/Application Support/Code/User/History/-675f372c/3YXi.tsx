import { PageShell } from 'designSystem/component/page-shell';
import { type PropsWithChildren, type FC } from 'react';
import { configureRequest } from '@personio-web/request';

import { PreliminaryPayrollCore } from './integrations/preliminary/PreliminaryPayrollCore';
import { DatevCore } from './integrations/datev/DatevCore';
import { PayrollGbPayrollCore } from './integrations/payroll-gb';
import { useSelectActivePayrollIntegration } from './hooks/useSelectActivePayrollIntegration';
import { PersonioSpinner } from './components/PersonioSpinner/PersonioSpinner';
import { ErrorBoundary as PayrollErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { type PayrollIntegrationsType } from './integrations-hub';
import { DatevLugCore } from './integrations/datev-lug/DatevLugCore';

export const IS_BROWSER = typeof window !== 'undefined';

export const API_BASE_URL: string = IS_BROWSER ? window.location.origin : '';

configureRequest({
  timeout: 300_000,
  baseURL: API_BASE_URL,
});

const HubExperience: Partial<
  Record<PayrollIntegrationsType, () => JSX.Element>
> = {
  preliminary: PreliminaryPayrollCore,
  datev: DatevCore,
  'datev-lug': DatevLugCore,
  gb: PayrollGbPayrollCore,
};

const PayrollRoot: FC<PropsWithChildren> = ({ children }) => {
  return <PageShell>{children}</PageShell>;
};

export const PayrollHub = () => {
  const { isContextLoading, currentIntegration } =
    useSelectActivePayrollIntegration();

  console.log('[P1]', { isContextLoading, currentIntegration });
  if (isContextLoading) {
    return <PayrollLoadingHub />;
  }

  // if the context is loaded and there's no integration id, then, we are in the preliminary
  const integration = currentIntegration?.id || 'preliminary';
  const Payroll = HubExperience[integration as keyof typeof HubExperience];

  console.log('[P2]', { integration, Payroll });
  if (!Payroll) return null;

  return (
    <PayrollErrorBoundary integrationType={integration}>
      <PayrollRoot>
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
