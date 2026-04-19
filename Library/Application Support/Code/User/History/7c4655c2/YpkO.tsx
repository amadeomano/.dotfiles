import { Dialog } from 'designSystem/component/dialog';

import {
  ConfirmationScreen,
  ErrorScreen,
  LoadingScreen,
} from './screens/ApprovePayrunFeedbackScreens';
import { usePayrunApprovalNavigator } from '../../hooks/usePayrunApprovalNavigator';
import { useApprovePayrollRun } from '../../hooks/useApprovePayrollRun';

import styles from './PayrunApprovalProcessingDialog.module.scss';

type PayrunApprovalProcessingDialogProps = {
  onClick: () => void;
  payRunId: string;
};

export const PayrunApprovalProcessingDialog = ({
  payRunId,
  onClick,
}: PayrunApprovalProcessingDialogProps) => {
  const { navigateToDocumentsTab } = usePayrunApprovalNavigator();
  const { approvePayrollRun, isLoading, status } = useApprovePayrollRun();

  approvePayrollRun(payRunId);

  const approvePayrunFeedbackScreen =
    !isLoading && status === 'success' ? (
      <ConfirmationScreen onClick={navigateToDocumentsTab} />
    ) : !isLoading && status === 'error' ? (
      <ErrorScreen onClick={() => approvePayrollRun(payRunId)} />
    ) : null;

  return (
    <Dialog.Util
      open
      title=""
      size="small"
      onOpenChange={onClick}
      blocking
      metadata={{
        actionName: isLoading ? 'approvePayrunFeedbackDialog' : '',
      }}
    >
      <Dialog.Content>
        <div className={styles.wrapper}>
          {isLoading ? <LoadingScreen /> : approvePayrunFeedbackScreen}
        </div>
      </Dialog.Content>
    </Dialog.Util>
  );
};
