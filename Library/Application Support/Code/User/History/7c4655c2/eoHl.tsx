import { useEffect } from 'react';
import { Dialog } from 'designSystem/component/dialog';

import {
  ConfirmationScreen,
  ErrorScreen,
} from './screens/ApprovePayrunFeedbackScreens';
import { LoadingScreen } from './screens/LoadingScreen';
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
  const { approvePayrollRun, isLoading, status } = useApprovePayrollRun();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => approvePayrollRun(payRunId), []);

  const approvePayrunFeedbackScreen =
    !isLoading && status === 'success' ? (
      <ConfirmationScreen />
    ) : !isLoading && status === 'error' ? (
      <ErrorScreen retryHandler={() => approvePayrollRun(payRunId)} />
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
          {/* {isLoading ? <LoadingScreen /> : approvePayrunFeedbackScreen} */}
          <LoadingScreen />
        </div>
      </Dialog.Content>
    </Dialog.Util>
  );
};
