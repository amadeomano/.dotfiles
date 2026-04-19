import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from 'designSystem/component/button';
import {
  TransferResult,
  usePostTransferData,
} from '@personio-web/payroll-data-payroll-integration-hub';

import { toaster } from 'designSystem/component/toaster';

import TransferActiveDialog from '../TransferActiveDialog/TransferActiveDialog';
import TransferResultDialog from '../TransferResultDialog/TransferResultDialog';
import { useTranslation } from 'react-i18next';
import { TEST_IDS, TRANSLATION_NAMESPACE } from '../../../../../../constants';
import { getParams } from '../../../../../../utils/navigationParams';

type TransferButtonProps = {
  configurationInvalid?: boolean;
  isTransferBlocked?: boolean;
};
const TransferButton: React.FC<TransferButtonProps> = ({
  configurationInvalid,
  isTransferBlocked,
}) => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'athree.hub',
  });

  const [transferResultDialogOpen, setTransferResultDialogOpen] =
    useState<boolean>(false);
  const [transferResult, setTransferResult] = useState<TransferResult['a3']>();

  const router = useRouter();
  const { legalEntityId } = getParams(router.query);

  const { mutate: triggerTransfer, isLoading } = usePostTransferData(
    'a3',
    legalEntityId,
  );

  const attemptToTriggerTransfer = () => {
    triggerTransfer(legalEntityId, {
      onSuccess: (data) => {
        setTransferResult(data);
        setTransferResultDialogOpen(true);
      },
      onError: () => {
        toaster.notify({
          variant: 'error',
          title: t('errors.transfer-error'),
        });
      },
    });
  };

  return (
    <>
      <Button
        variant="emphasisAccent"
        onClick={attemptToTriggerTransfer}
        loading={isLoading}
        disabled={isTransferBlocked || configurationInvalid || !legalEntityId}
        metadata={{
          testId: TEST_IDS.TransferButton,
        }}
      >
        {t('transfer-button')}
      </Button>
      <TransferActiveDialog open={isLoading} />
      <TransferResultDialog
        open={transferResultDialogOpen}
        onClose={() => setTransferResultDialogOpen(false)}
        transferResult={transferResult}
      />
    </>
  );
};

export default TransferButton;
