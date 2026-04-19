import { useEffect } from 'react';
import { Dialog } from 'designSystem/component/dialog';
import { Inline } from 'designSystem/component/layout';
import { ErrorScreen } from './screens/ErrorSreen';
import { ConfirmationScreen } from './screens/ConfirmationScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { useApprovePayrollRun } from '../../hooks/useApprovePayrollRun';
import { Inline } from '@personio-web/design-system-component-layout-types';

type Props = { payRunId: string; onClose: () => void };
export const PayrunApprovalProcessingDialog = ({
  payRunId,
  onClose,
}: Props) => {
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
      onOpenChange={!isLoading ? onClose : undefined}
      blocking
      metadata={{
        actionName: isLoading ? 'approvePayrunFeedbackDialog' : '',
      }}
    >
      <Dialog.Content>
        <Inline align="center">
          {isLoading ? <LoadingScreen /> : approvePayrunFeedbackScreen}
        </Inline>
      </Dialog.Content>
    </Dialog.Util>
  );
};
