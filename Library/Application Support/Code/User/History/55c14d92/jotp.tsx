import { useEmployeeDetailsPanelStepperNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { SidePanelNavbar } from '../../../../components/PayrollSidePanel/PayrollSidePanel';

export const EmployeeDetailsPanelNavbar = () => {
  const { nextNavigator, prevNavigator } =
    useEmployeeDetailsPanelStepperNavigator();

  return <SidePanelNavbar onNext={nextNavigator()} onPrev={prevNavigator()} />;
};
