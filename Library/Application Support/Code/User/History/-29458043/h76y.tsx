import { LayoutBleed } from 'designSystem/component/page-layout';
import { LocalBanner } from 'designSystem/component/local-banner';
import { getLocale } from '@personio-web/i18n';

import {
  getPayRunById,
  usePayrollRuns,
} from '../../hooks/payroll-lifecycle/usePayrollRuns';
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
import { useApprovePayrollRunActions } from './hooks/useApprovePayrollRunActions';
import { PayrunApprovalProcessingDialog } from './components/PayrunApprovalProcessingDialog/PayrunApprovalProcessingDialog';

type Props = {
  runId: string;
};

export const PayRollRunDetailsModal = ({ runId }: Props) => {
  const { payrollRuns, isPayRunsFetching } = usePayrollRuns();
  const { legalEntityId } = useGbNavigation();
  const { payGroups } = usePayGroups();
  const { compensationSchemas, isFetching: isFetchingCompensationSchemas } =
    useEmployerCompensationSchemas(legalEntityId);
  const { navigateOutOfPayRun } = usePayRunNavigator();
  const { getActiveEmployeeId, navigateOutOfEmployeeDetails } =
    useEmployeeDetailsPanelNavigator();
  const currentPayRun = getPayRunById(payrollRuns?.data || [], runId);

  const { primaryAction, moreActions, isApprovePayrunDialogOpen, onClose } =
    useApprovePayrollRunActions(currentPayRun);

  const getTitle = titleColumn(payGroups?.data ?? []).accessor;
  const previousPayrun: PayrollRun | undefined =
    currentPayRun &&
    payrollRuns?.data.find(
      (payrun) => payrun.period === currentPayRun?.period - 1,
    );

  const title = currentPayRun && (getTitle(currentPayRun, 0) as string);
  const isEmployeeDetailsOpen = !!getActiveEmployeeId();

  const date = currentPayRun?.approvedDate
    ? Intl.DateTimeFormat(getLocale(), {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })?.format(new Date(currentPayRun?.approvedDate))
    : '';
  const time = currentPayRun?.approvedDate
    ? Intl.DateTimeFormat(getLocale(), {
        hour: 'numeric',
        minute: 'numeric',
      })?.format(new Date(currentPayRun?.approvedDate))
    : '';

  const approvedMessage = `${date} at ${time}`;

  return (
    <>
      <EmployeeDetailsPanelContextProvider>
        <PayrollModalLayout
          title={title ?? ''}
          onClose={navigateOutOfPayRun}
          primaryAction={primaryAction}
          moreActions={moreActions}
        >
          {currentPayRun?.status === 'APPROVED' && (
            <LocalBanner
              title="Payrun completely approved"
              variant="success"
              body={approvedMessage}
            />
          )}
          <Summary
            currentPayRun={currentPayRun}
            previousPayRun={previousPayrun}
          />
          <LayoutBleed side="right">
            <EmployeesTable
              compensationSchemas={compensationSchemas?.data}
              payRun={currentPayRun}
              isLoading={isPayRunsFetching || isFetchingCompensationSchemas}
            />
          </LayoutBleed>
          <SidePanel
            isOpen={isEmployeeDetailsOpen}
            onClose={navigateOutOfEmployeeDetails}
            navbar={<EmployeeDetailsPanelNavbar />}
          >
            <EmployeeDetailsPanelContent />
          </SidePanel>
        </PayrollModalLayout>
      </EmployeeDetailsPanelContextProvider>
      {isApprovePayrunDialogOpen && (
        <PayrunApprovalProcessingDialog payRunId={runId} onClick={onClose} />
      )}
    </>
  );
};
