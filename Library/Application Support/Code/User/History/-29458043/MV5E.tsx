import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import moment from 'moment-timezone';
import { useRouter } from 'next/router';

import { LayoutBleed } from 'designSystem/component/page-layout';
import { Dialog } from 'designSystem/component/dialog';
import { LocalBanner } from 'designSystem/component/local-banner';

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
import { useApprovePayrollRunActions } from '../../hooks/payroll-lifecycle/useApprovePayrollRunActions';
import {
  LoadingScreen,
  ConfirmationScreen,
  ErrorScreen,
} from './components/ApprovePayrunFeedbackScreens/ApprovePayrunFeedbackScreens';
import {
  useTabNavigator,
  getQueryWithNewTab,
} from '../../hooks/navigators/useTabsNavigator';
import { getQueryWithoutPayRun } from '../../hooks/navigators/usePayRunNavigator';

import styles from './PayRollRunDetailsModal.module.scss';

type Props = {
  runId: string;
  setShouldRedirectToDocuments: Dispatch<SetStateAction<boolean>>;
};

export const PayRollRunDetailsModal = ({
  runId,
  setShouldRedirectToDocuments,
}: Props) => {
  const { payrollRuns, isPayRunsFetching } = usePayrollRuns();
  const { legalEntityId } = useGbNavigation();
  const { payGroups } = usePayGroups();
  const { compensationSchemas, isFetching: isFetchingCompensationSchemas } =
    useEmployerCompensationSchemas(legalEntityId);
  const { navigateOutOfPayRun } = usePayRunNavigator();
  const { getActiveEmployeeId, navigateOutOfEmployeeDetails } =
    useEmployeeDetailsPanelNavigator();
  const { primaryAction, moreActions } = useApprovePayrollRunActions();

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const router = useRouter();

  const {
    isLoading: isApprovePayrunLoading,
    status: approvePayrunStatus,
    onClick: onApprovePayrun,
  } = primaryAction;

  useEffect(() => {
    if (isApprovePayrunLoading) {
      setIsActionDialogOpen(true);
    }
  }, [isApprovePayrunLoading]);

  const onCloseDialog = () => {
    setIsActionDialogOpen(false);
  };

  const getTitle = titleColumn(payGroups?.data ?? []).accessor;
  const currentPayRun: PayrollRun | undefined = payrollRuns?.data.find(
    (payrun) => payrun.id === runId,
  );
  if (currentPayRun) currentPayRun.status = 'DRAFT';
  const previousPayrun: PayrollRun | undefined =
    currentPayRun &&
    payrollRuns?.data.find(
      (payrun) => payrun.period === currentPayRun?.period - 1,
    );

  const title = currentPayRun && (getTitle(currentPayRun, 0) as string);
  const isEmployeeDetailsOpen = !!getActiveEmployeeId();

  const date = moment(currentPayRun?.approvedDate).format('Do MMMM YYYY');
  const time = moment
    .tz(currentPayRun?.approvedDate, moment.tz.guess())
    .format('LT');
  const approvedMessage = `${date} at ${time}`;

  const approvePayrunFeedbackScreen = (
    <ConfirmationScreen
      onClick={() => {
        const query = getQueryWithNewTab(
          getQueryWithoutPayRun(router.query),
          'documents',
        );
        router.replace({ query });
      }}
    />
  );

  useEffect(() => {
    setShouldRedirectToDocuments(false);
  }, [setShouldRedirectToDocuments]);

  return (
    <>
      <EmployeeDetailsPanelContextProvider>
        <PayrollModalLayout
          title={title ?? ''}
          onClose={navigateOutOfPayRun}
          primaryAction={primaryAction}
          moreActions={moreActions}
          payrunInfo={{
            payrunId: currentPayRun?.id,
            payrunStatus: currentPayRun?.status,
          }}
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

      <Dialog.Util
        title=""
        size="small"
        open={isActionDialogOpen}
        onOpenChange={onCloseDialog}
        blocking
        metadata={{
          actionName: isApprovePayrunLoading
            ? 'approvePayrunFeedbackDialog'
            : '',
        }}
      >
        <Dialog.Content>
          <div className={styles.wrapper}>
            {isApprovePayrunLoading ? (
              <LoadingScreen />
            ) : (
              approvePayrunFeedbackScreen
            )}
          </div>
        </Dialog.Content>
      </Dialog.Util>
    </>
  );
};
