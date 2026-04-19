import { PayRollRunDetailsModal } from './features/PayRollRunDetailsModal/PayRollRunDetailsModal';
import { ReportRouter } from './features/reports/components/ReportRouter';
import { usePayRunNavigator } from './hooks/navigators/usePayRunNavigator';
import { useTabNavigator } from './hooks/navigators/useTabsNavigator';
import { usePermission } from './hooks/payroll-lifecycle/usePermissions';
import {
  useGbNavigation,
  useSyncSetup,
} from './hooks/usePayrollGbBreadcrumbsNavigation';

import { useLegalEntitiesPicker } from './hooks/layout/useLegalEntitiesPicker';
import { useTabsPicker } from './hooks/layout/useTabsPicker';

import { PayrollLayout } from './components/Layout/PayrollLayout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const PayrollGbPayrollCore = () => {
  const { TabComponent, navigateTo } = useTabNavigator();
  const { legalEntityId } = useGbNavigation();
  // const { getActionRights } = usePermission(legalEntityId);
  useSyncSetup('/payroll/personal');
  const router = useRouter();
  // const isViewAllowed = getActionRights('ALL').includes('VIEW');

  const legalEntities = useLegalEntitiesPicker();
  const tabs = useTabsPicker();

  const { getActivePayRun } = usePayRunNavigator();
  const activeRun = getActivePayRun();

  const [shouldRedirectToDocuments, setShouldRedirectToDocuments] =
    useState(false);

  useEffect(() => {
    const isDialogOpen = Object.keys(router.query).find(
      (key) => key === 'active-run',
    );
    if (shouldRedirectToDocuments && !isDialogOpen) {
      navigateTo('documents');
      setShouldRedirectToDocuments(false);
    }
  }, [navigateTo, router.query, shouldRedirectToDocuments]);

  return (
    <>
      <PayrollLayout title="Payroll" legalEntities={legalEntities} tabs={tabs}>
        <TabComponent />
      </PayrollLayout>
      {/* TODO: will be replaced with a Modal Router and consequently main router */}
      {activeRun && (
        <PayRollRunDetailsModal
          runId={activeRun}
          setShouldRedirectToDocuments={setShouldRedirectToDocuments}
        />
      )}
      <ReportRouter />
    </>
  );
};
export default PayrollGbPayrollCore;
