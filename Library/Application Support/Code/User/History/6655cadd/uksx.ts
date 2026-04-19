import { useRouter } from 'next/router';
import { type PayrollActions } from '../../../types';
import { useApprovePayrollAction } from './payroll-lifecycle/useApprovePayrollAction';
import { useRefreshPayrunAction } from './payroll-lifecycle/useRefreshPayrunAction';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';
import { useLegalEntityNavigator } from './navigators/useLegalEntityNavigator';

export const usePayrollGbActions = () => {
  const router = useRouter();
  const currentSlugs = (router.query.slug as string[])?.join('/');

  const { unsetLegalEntityID } = useLegalEntityNavigator();
  const approveAction = useApprovePayrollAction();
  const { run } = useCurrentPayrollRun();
  const { refresh: refreshPayrollRun } = useRefreshPayrunAction();

  const payrollActions: PayrollActions = [
    ...(run?.status !== 'APPROVED' ? [approveAction] : []),
    {
      id: 'custom-actions',
      type: 'dropdown',
      label: '...',
      items: [
        {
          id: 'refresh',
          name: 'Refresh payroll run',
          onSelect: () => refreshPayrollRun(),
        },
      ],
    },
  ];

  return [...payrollActions];
};
