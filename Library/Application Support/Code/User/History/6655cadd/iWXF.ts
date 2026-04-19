import { type PayrollAction } from '../../../types';
import { useApprovePayrollAction } from './payroll-lifecycle/useApprovePayrollAction';
import { useRefreshPayrunAction } from './payroll-lifecycle/useRefreshPayrunAction';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';
import { useGbNavigation } from './usePayrollGbBreadcrumbsNavigation';
import { usePermission } from './payroll-lifecycle/usePermissions';

export const usePayrollGbActions = () => {
  const { legalEntityId } = useGbNavigation();
  const { getActionRights } = usePermission(legalEntityId);
  const approveAction = useApprovePayrollAction();
  const { run } = useCurrentPayrollRun();
  const { refresh: refreshPayrollRun } = useRefreshPayrunAction();

  const isViewAllowed = getActionRights('ALL').includes('VIEW');
  if (!isViewAllowed) return [];

  const payrollActions: PayrollAction[] = [
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
