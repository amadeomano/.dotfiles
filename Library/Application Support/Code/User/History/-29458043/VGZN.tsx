import { LayoutBleed } from 'designSystem/component/page-layout';

import { usePayrollRuns } from '../../hooks/payroll-lifecycle/usePayrollRuns';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';
import { usePayGroups } from '../../hooks/payroll-lifecycle/usePayGroups';
import { Summary } from './components/Summary/Summary';
import { EmployeesTable } from './components/EmployeesTable/EmployeesTable';
import { type PayrollRun } from '../../utils/payrollRun';
import { useEmployerCompensationSchemas } from '../../tabs/ManageTab/CompensationTab/useEmployerCompensationSchemas';
import { usePayRunNavigator } from '../../hooks/navigators/usePayRunNavigator';
import { titleColumn } from '../../tabs/PayRunsTab/tableUtils/columns';
import { PayrollModalLayout } from '../../components/Layout/PayrollModalLayout';
import { EmployeeDetailsPanelContextProvider } from './contexts/EmployeeDetailsPanelContext';
import { useEmployeeDetailsPanelNavigator } from './hooks/useEmployeeDetailsPanelNavigator';
import { SidePanel } from '../../components/Layout/PayrollSidePanel';
import { EmployeeDetailsPanelNavbar } from './components/EmployeeDetailsPanel/EmployeeDetailsPanelNavbar';
import { EmployeeDetailsPanelContent } from './components/EmployeeDetailsPanel/EmployeeDetailsPanelContent';

type Props = { runId: string };
export const PayRollRunDetailsModal = ({ runId }: Props) => {
  const { payrollRuns, isPayRunsFetching } = usePayrollRuns();
  const { legalEntityId } = useGbNavigation();
  const { payGroups } = usePayGroups();
  const { compensationSchemas } = useEmployerCompensationSchemas(legalEntityId);
  const { navigateOutOfPayRun } = usePayRunNavigator();
  const { getActiveEmployeeId, navigateOutOfEmployeeDetails } =
    useEmployeeDetailsPanelNavigator();

  const getTitle = titleColumn(payGroups?.data ?? []).accessor;
  const currentPayRun: PayrollRun | undefined = payrollRuns?.data.find(
    (payrun) => payrun.id === runId,
  );
  const previousPayrun: PayrollRun | undefined =
    currentPayRun &&
    payrollRuns?.data.find(
      (payrun) => payrun.period === currentPayRun?.period - 1,
    );

  const title = currentPayRun && (getTitle(currentPayRun, 0) as string);
  const isEmployeeDetailsOpen = !!getActiveEmployeeId();

  return (
    <EmployeeDetailsPanelContextProvider>
      <PayrollModalLayout title={title ?? ''} onClose={navigateOutOfPayRun}>
        <Summary
          currentPayRun={currentPayRun}
          previousPayRun={previousPayrun}
        />
        <LayoutBleed side="right">
          <EmployeesTable
            compensationSchemas={compensationSchemas?.data}
            payRun={currentPayRun}
            isLoading={isPayRunsFetching}
          />
        </LayoutBleed>
        <SidePanel
          isOpen={isEmployeeDetailsOpen}
          onClose={navigateOutOfEmployeeDetails}
        >
          <EmployeeDetailsPanelNavbar />
          <EmployeeDetailsPanelContent />
        </SidePanel>
      </PayrollModalLayout>
    </EmployeeDetailsPanelContextProvider>
  );
};
