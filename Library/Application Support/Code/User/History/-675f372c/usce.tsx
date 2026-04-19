import {
  PageModal,
  Action,
  PageHierarchical,
  BreadcrumbNav,
} from 'designSystem/component/page';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { configureRequest } from '@personio-web/request';
import { PageShell } from 'designSystem/component/page-shell';
import { type FC, type PropsWithChildren } from 'react';

import { ErrorBoundary as PayrollErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { PersonioSpinner } from './components/PersonioSpinner/PersonioSpinner';
import { useSelectActivePayrollIntegration } from './hooks/useSelectActivePayrollIntegration';
import { type PayrollIntegrationsType } from './integrations-hub';
import { DatevLugCore } from './integrations/datev-lug/DatevLugCore';
import { DatevCore } from './integrations/datev/DatevCore';
import LoketCore from './integrations/loket';
import { PayrollGbPayrollCore } from './integrations/payroll-gb';
import { PreliminaryPayrollCore } from './integrations/preliminary/PreliminaryPayrollCore';

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
  loket: LoketCore,
};

type RootProps = { usesPage: boolean };
const PayrollRoot: FC<PropsWithChildren<RootProps>> = ({
  children,
  usesPage,
}) => {
  const Base = usesPage ? PageHierarchical.Root : PageShell;
  return <Base>{children}</Base>;
};

export const PayrollHub = () => {
  const { isContextLoading, currentIntegration } =
    useSelectActivePayrollIntegration();

  if (isContextLoading) {
    return <PayrollLoadingHub />;
  }

  // if the context is loaded and there's no integration id, then, we are in the preliminary
  const integration = currentIntegration?.id || 'preliminary';
  const Payroll = HubExperience[integration as keyof typeof HubExperience];

  if (!Payroll) return null;

  return (
    <PayrollErrorBoundary integrationType={integration}>
      <PayrollRoot usesPage={integration === 'gb'}>
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
