import React, { useState } from 'react';
import { useQueryClient } from 'react-query';
import { Button } from 'designSystem/component/button';
import { toaster } from 'designSystem/component/toaster';
import {
  PayrollIntegrationContextAPI,
  XeroTransferState,
} from '@personio-web/payroll-data-payroll-integration-context';
import { usePostTransferData } from '@personio-web/payroll-data-payroll-integration-hub';

import PayRunDraftExistsDialog from './components/PayRunDraftExistsDialog/PayRunDraftExistsDialog';
import TransferProcessingDialog from './components/TransferProcessingDialog/TransferProcessingDialog';
import { useTranslation } from 'react-i18next';
import { TEST_IDS, TRANSLATION_NAMESPACE } from '../../../../../../constants';
import { getParams } from '../../../../../../utils/navigationParams';

type TransferButtonProps = {
  configurationInvalid?: boolean;
  isTransferBlocked?: boolean;
  transferState?: XeroTransferState;
};
const TransferButton: React.FC<TransferButtonProps> = ({
  configurationInvalid,
  isTransferBlocked,
  transferState,
}) => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'xero.hub',
  });

  const [payRunDraftExistsDialogOpen, setPayRunDraftExistsDialogOpen] =
    useState<boolean>(false);
  const [transferProcessingDialogOpen, setTransferProcessingDialogOpen] =
    useState<boolean>(false);
  const client = useQueryClient();

  const {
    params: { legalEntityId },
  } = usePayrollHubNavigator();
  const { mutate: triggerTransfer, isLoading } = usePostTransferData(
    'xero',
    legalEntityId,
  );

  const attemptToTriggerTransfer = () => {
    if (transferState?.state === 'PAY_RUN_DRAFT_EXISTS') {
      setPayRunDraftExistsDialogOpen(true);
    } else if (transferState?.state === 'PROCESSING') {
      setTransferProcessingDialogOpen(true);
    } else {
      triggerTransfer(legalEntityId, {
        onSuccess: (data) => {
          client.invalidateQueries([
            PayrollIntegrationContextAPI.KEY,
            legalEntityId,
          ]);
        },
        onError: () => {
          toaster.notify({
            variant: 'error',
            title: t('transfer-error'),
          });
        },
      });
    }
  };

  return (
    <>
      <Button
        variant="emphasisAccent"
        onClick={attemptToTriggerTransfer}
        loading={isLoading}
        disabled={isTransferBlocked || configurationInvalid || !legalEntityId}
        metadata={{ testId: TEST_IDS.TransferButton }}
      >
        {t('transfer-button')}
      </Button>
      <PayRunDraftExistsDialog
        open={payRunDraftExistsDialogOpen}
        onClose={() => setPayRunDraftExistsDialogOpen(false)}
      />
      <TransferProcessingDialog
        open={transferProcessingDialogOpen}
        onClose={() => setTransferProcessingDialogOpen(false)}
        lastTriggered={transferState?.lastTriggered ?? undefined}
      />
    </>
  );
};

export default TransferButton;
