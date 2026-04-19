import { type FC } from 'react';
import { useEmployeeDetailsPanelStepperNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { SidePanelHeader } from '../../../../components/Layout/PayrollSidePanel';

export const EmployeeDetailsPanelHeader: FC = () => {
  const { nextNavigator, prevNavigator } =
    useEmployeeDetailsPanelStepperNavigator();

  return <SidePanelHeader onNext={nextNavigator()} onPrev={prevNavigator()} />;
};
EmployeeDetailsPanelHeader.displayName = 'SidePanelHeader';
