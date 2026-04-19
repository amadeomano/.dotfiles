import { ReportRouter } from './features/reports/components/ReportRouter';
import {
  useGbNavigation,
  useSyncSetup,
} from './hooks/usePayrollGbBreadcrumbsNavigation';
import { usePermission } from './hooks/payroll-lifecycle/usePermissions';
import { useTabNavigator } from './hooks/navigators/useTabsNavigator';
import { usePayRunNavigator } from './hooks/navigators/usePayRunNavigator';
import { PayRollRunDetailsModal } from './features/PayRollRunDetailsModal/PayRollRunDetailsModal';

import { useLegalEntitiesPicker } from './hooks/layout/useLegalEntitiesPicker';
import { useTabsPicker } from './hooks/layout/useTabsPicker';

import { PayrollLayout } from './components/Layout/PayrollLayout';

export const PayrollGbPayrollCore = () => {
  const { TabComponent } = useTabNavigator();
  const { legalEntityId } = useGbNavigation();
  const { getActionRights } = usePermission(legalEntityId);
  useSyncSetup('/payroll/personal');

  const isViewAllowed = getActionRights('ALL').includes('VIEW');

  const legalEntities = useLegalEntitiesPicker();
  const tabs = useTabsPicker();

  const { getActivePayRun } = usePayRunNavigator();
  const activeRun = getActivePayRun();

  return (
    <>
      <PayrollLayout title="Payroll" legalEntities={legalEntities} tabs={tabs}>
        {isViewAllowed && <TabComponent />}
      </PayrollLayout>
      {activeRun && <PayRollRunDetailsModal runId={activeRun} />}
      <ReportRouter />
    </>
  );
};
