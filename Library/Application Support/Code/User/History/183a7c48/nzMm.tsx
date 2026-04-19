import { ReportRouter } from './features/reports/components/ReportRouter';
import { usePayrollGbActions } from './hooks/usePayrollGbActions';
import {
  useGbNavigation,
  useSyncSetup,
} from './hooks/usePayrollGbBreadcrumbsNavigation';
import { usePermission } from './hooks/payroll-lifecycle/usePermissions';
import { useTabNavigator } from './hooks/navigators/useTabsNavigator';

import { useLegalEntitiesPicker } from './hooks/layout/useLegalEntitiesPicker';
import { useTabsPicker } from './hooks/layout/useTabsPicker';

// Temporary Layout based on Hierarchical Page
import { PayrollLayout } from './components/temp-layout/PayrollLayout';

export const PayrollGbPayrollCore = () => {
  const { TabComponent } = useTabNavigator();
  const { legalEntityId } = useGbNavigation();
  const { getActionRights } = usePermission(legalEntityId);
  useSyncSetup('/payroll/personal');

  const payrollHubActions = usePayrollGbActions();

  const isViewAllowed = getActionRights('ALL').includes('VIEW');

  const legalEntities = useLegalEntitiesPicker();
  const tabs = useTabsPicker();

  return (
    <PayrollLayout title="Payroll" legalEntities={legalEntities} tabs={tabs}>
      <TabComponent />
      <ReportRouter />
    </PayrollLayout>
  );

  // return (
  //   <PayrollProvider
  //     getBreadcrumbs={() => breadcrumbs}
  //     getPayrollActions={() => payrollHubActions}
  //   >
  //     <PayrollHubLayout>
  //       <PayrollHubLayout.Header
  //         tabsDefinition={tabsDefinition}
  //         title="Payroll"
  //         usesPeriodNavigator={false}
  //       >
  //         <PayrollHubLayout.Header.Base />
  //       </PayrollHubLayout.Header>
  //       <PayrollHubLayout.Content>
  //         {isViewAllowed && (
  //           <>
  //             <TabComponent />
  //             <ReportRouter />
  //           </>
  //         )}
  //       </PayrollHubLayout.Content>
  //     </PayrollHubLayout>
  //   </PayrollProvider>
  // );
};
