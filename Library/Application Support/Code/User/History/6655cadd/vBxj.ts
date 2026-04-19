import { type PayrollActions } from '../../../types';
import { useApprovePayrollAction } from './payroll-lifecycle/useApprovePayrollAction';
import { useRefreshPayrunAction } from './payroll-lifecycle/useRefreshPayrunAction';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';
import { usePermission } from './payroll-lifecycle/usePermissions';

export const usePayrollGbActions = () => {
  const approveAction = useApprovePayrollAction();
  const { run } = useCurrentPayrollRun();
  const { refresh: refreshPayrollRun } = useRefreshPayrunAction();

  const payrollActions: PayrollActions = [
    ...(run?.status !== 'APPROVED' ? approveAction : []),
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
