import { useRouter } from 'next/router';
import { PayrollActions } from '../../../types';
import { useApprovePayrollAction } from './payroll-lifecycle/useApprovePayrollAction';
import { useOpenCreatePensionSchemeAction } from './payroll-lifecycle/useOpenCreatePensionSchemeAction';
import { useCurrentPayrollRun } from '../data/useCurrentPayrollRun';

export const usePayrollGbActions = () => {
  const router = useRouter();
  const currentSlugs = (router.query.slug as string[])?.join('/');

  const approveAction = useApprovePayrollAction();
  const createPensionSchemeAction = useOpenCreatePensionSchemeAction();
  const { run } = useCurrentPayrollRun();

  const payrollActions: PayrollActions = [
    ...(run?.status !== 'APPROVED' ? [approveAction] : []),
    ...(/manage\/pension/.test(currentSlugs)
      ? [createPensionSchemeAction]
      : []),
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
