import React from 'react';
import type { PersonioPage } from '../../@types/page';
import { FederatedModule } from '@personio-web/federated-module';
import { PersonioSpinner } from './components/PersonioSpinner';

import type { Payroll_View_PreliminaryPayroll_FedProps } from '@personio-web/payroll-view-preliminary-payroll-types';

const preliminaryViewProps: Payroll_View_PreliminaryPayroll_FedProps = {
  remote: 'payroll',
  module: './view/preliminary-payroll',
  onError: console.error,
};

// eslint-disable-next-line react/display-name
const PreliminaryPayrollView = React.memo(() => <p>Hello</p>);

const PreliminaryPayrollPage: PersonioPage = () => <PreliminaryPayrollView />;

PreliminaryPayrollPage.pageTitleKey = 'payroll';

export default PreliminaryPayrollPage;
