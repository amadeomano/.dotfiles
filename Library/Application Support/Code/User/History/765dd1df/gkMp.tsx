import { useApprovePayrollRun } from '@personio-web/payroll-data-payroll-me';
import { approvePayrollRunAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { InlineAlert } from 'designSystem/component/inline-alert';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toaster } from 'designSystem/component/toaster';
import { useCurrentPayrollRun } from '../../data/useCurrentPayrollRun';
import { ActionsTypes, type DialogAction } from '../../../../types';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from '../temporary/useWrapQuery';
import { Stack } from 'designSystem/component/layout';
import { usePermission } from './usePermissions';

export const useApprovePayrollAction = (): DialogAction => {
  const { t } = useTranslation('payroll');
  const [dialogState, setDialogState] = useState(false);
  const { mutate, isLoading } = useWrapMutation(
    useApprovePayrollRun,
    approvePayrollRunAPI,
  );
  const defaultHeaders = useGetDefaultHeaders();

  const { run, refetch } = useCurrentPayrollRun();

  const approvePayroll = (id: string) => {
    mutate(
      {
        requestPathParams: {
          id,
        },
        requestHeaders: defaultHeaders,
      },
      {
        onSuccess() {
          toaster.notify({
            variant: 'success',
            title: 'Payroll approved!',
            description:
              'You have successfully approved payroll for this period, nice!',
            showCloseButton: true,
            duration: 5000,
          });

          refetch();
        },
        onError(...args: unknown[]) {
          console.error('approvePayroll error', args);
        },
      },
    );
    setDialogState(false);
  };

  return {
    id: 'approve-payroll',
    type: ActionsTypes.DIALOG,
    title: 'Approve payroll',
    description: `Continuing will close this payroll cycle in preparation for processing payroll.`,
    content: <ApprovalBanner />,
    state: {
      isOpen: dialogState,
      onOpenChange: setDialogState,
    },
    footer: {
      secondary: {
        children: t('cancel'),
        variant: 'default',
      },
      primary: {
        children: t('approve-payroll-confirmation-button-confirm'),
        variant: 'emphasisAccent',
        onClick: () => run?.id && approvePayroll(run.id),
        loading: isLoading,
      },
    },
    trigger: {
      variant: 'emphasisAccent',
      children: t('approve-payroll-button'),
      // onClose: () => setDialogState(false),
      loading: isLoading,
      disabled: !run?.id,
    },
  };
};

const ApprovalBanner = () => {
  const { t } = useTranslation('payroll');

  return (
    <Stack space="gap-default">
      <InlineAlert
        variant="ghost"
        sentiment="warning"
        message={'You will not be able to reopen after approving payroll.'}
      />
    </Stack>
  );
};
