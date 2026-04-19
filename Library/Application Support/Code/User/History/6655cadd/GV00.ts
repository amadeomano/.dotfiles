import { useRouter } from 'next/router';
import { PayrollActions } from '../../../types';
import { useApprovePayrollAction } from './payroll-lifecycle/useApprovePayrollAction';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';

export const usePayrollGbActions = () => {
  const router = useRouter();
  const approveAction = useApprovePayrollAction();
  const { run } = useCurrentPayrollRun();
  const currentSlugs = (router.query.slugs as string[])?.join('/');
  console.log('current slugs', currentSlugs);

  const payrollActions: PayrollActions = [
    ...(run?.status !== 'APPROVED' ? [approveAction] : []),
    ...(/manage\/pension/.test(currentSlugs) ? [approveAction] : []),
    {
      id: 'custom-actions',
      type: 'dropdown',
      label: '...',
      items: [
        {
          id: 'placeholder',
          name: 'Nothing',
          onSelect: () => alert('nothing was done'),
        },
      ],
    },
  ];

  return [...payrollActions];
};
