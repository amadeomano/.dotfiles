import { PayRollRunDetailsModal } from './features/PayRollRunDetailsModal/PayRollRunDetailsModal';
import { ReportRouter } from './features/reports/components/ReportRouter';
import { usePayRunNavigator } from './hooks/navigators/usePayRunNavigator';
import { useTabNavigator } from './hooks/navigators/useTabsNavigator';
import { usePermission } from './hooks/payroll-lifecycle/usePermissions';
import {
  useGbNavigation,
  useSyncSetup,
} from './hooks/usePayrollGbBreadcrumbsNavigation';
import {
  PayrollLayout,
  HeaderContent,
} from '@personio-web/payroll-component-payroll-layout';

import { useLegalEntitiesPicker } from './hooks/layout/useLegalEntitiesPicker';
import { useTabsPicker } from './hooks/layout/useTabsPicker';
import { ParallelModeStatus } from './components/ParallelModeStatus/ParallelModeStatus';

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
        <HeaderContent>
          {/* TODO: commenting this line due to mothballing -- parallel mode is still not functional in dev env */}
          {/* <ParallelModeStatus /> */}
        </HeaderContent>
        {isViewAllowed && <TabComponent />}
      </PayrollLayout>
      {/* TODO: will be replaced with a Modal Router and consequently main router */}
      {activeRun && <PayRollRunDetailsModal runId={activeRun} />}
      <ReportRouter />
    </>
  );
};
export default PayrollGbPayrollCore;
