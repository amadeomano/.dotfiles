import { useRouter } from 'next/router';
import { PayrollActions } from '../../../types';
import { useAuthContext } from '@personio-web/auth-context';
import { usePreliminaryDocuments } from './usePreliminaryDocuments';
import { usePreliminaryExportDocuments } from './usePreliminaryExportDocuments';
import { useTranslation } from 'react-i18next';
import { usePreliminaryApprovePayroll } from './usePreliminaryApprovePayroll';

export const usePreliminaryHubActions = () => {
  const { query } = useRouter();
  const { t } = useTranslation('payroll');

  const documentsAction = usePreliminaryDocuments();
  const onOpenDocumentsDialog = () => documentsAction.state.onOpenChange(true);
  const generateExportAction = usePreliminaryExportDocuments(
    onOpenDocumentsDialog,
  );
  const approvePayrollAction = usePreliminaryApprovePayroll(
    onOpenDocumentsDialog,
  );

  const payrollActions: PayrollActions = [
    approvePayrollAction,
    generateExportAction,
    documentsAction,
    {
      id: 'custom-actions',
      type: 'dropdown',
      label: '...',
      items: [
        {
          id: 'customize-table',
          name: t('dropdown-links-edit'),
          onSelect: console.log,
        },
        {
          id: 'new-payroll-group',
          name: t('dropdown-links-add-accounting-groups'),
          onSelect: console.log,
        },
      ],
    },
  ];

  return payrollActions;
};
