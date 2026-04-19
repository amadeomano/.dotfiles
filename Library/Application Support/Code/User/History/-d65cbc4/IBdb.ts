import { useQueryClient } from 'react-query';
import { useState } from 'react';

import { listPayrollRunsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { type ActionProps } from '../../../components/Layout/PayrollModalLayout';
import { type PayrollRun } from '../../../utils/payrollRun';

export const useApprovePayrollRunActions = (payRun?: PayrollRun) => {
  const queryClient = useQueryClient();
  const [isApprovePayrunDialogOpen, setIsApprovePayrunDialogOpen] =
    useState(true);

  const refetchPayrollRunData = () => {
    queryClient.invalidateQueries([listPayrollRunsAPI.KEY]);
  };

  const primaryAction: ActionProps = {
    title: 'Approve',
    isVisible: payRun?.status !== 'APPROVED',
    onClick: () => setIsApprovePayrunDialogOpen(true),
  };
  const moreActions: ActionProps[] = [
    { title: 'Refresh', onClick: refetchPayrollRunData },
  ];

  return {
    primaryAction,
    moreActions,
    isApprovePayrunDialogOpen,
    onClose: () => setIsApprovePayrunDialogOpen(false),
  };
};
