import { type FC } from 'react';
import { useEmployeeDetailsPanelStepperNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { SidePanelHeader } from '../../../../components/Layout/PayrollSidePanel';

export const EmployeeDetailsPanelNavbar: FC = () => {
  const { nextNavigator, prevNavigator } =
    useEmployeeDetailsPanelStepperNavigator();

  return <SidePanelHeader onNext={nextNavigator()} onPrev={prevNavigator()} />;
};
EmployeeDetailsPanelNavbar.displayName = 'SidePanelHeader';
