import { useEffect } from 'react';

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
  isOpen: boolean;
  onClick: () => void;
  payRunId: string;
};

export const PayrunApprovalProcessingDialog = ({
  isOpen,
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
      title=""
      size="small"
      open={isOpen}
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
