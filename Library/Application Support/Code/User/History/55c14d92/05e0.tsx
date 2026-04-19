import { type FC } from 'react';
import { useEmployeeDetailsPanelStepperNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { SidePanelNavbar } from '../../../../components/Layout/PayrollSidePanel';

export const EmployeeDetailsPanelNavbar = () => {
  const { nextNavigator, prevNavigator } =
    useEmployeeDetailsPanelStepperNavigator();

  return <SidePanelNavbar onNext={nextNavigator()} onPrev={prevNavigator()} />;
};
SidePanelNavbar.displayName = 'SidePanelNavbar';
