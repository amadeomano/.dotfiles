import { type FC } from 'react';
import { useEmployeeDetailsPanelStepperNavigator } from '../../hooks/useEmployeeDetailsPanelNavigator';
import { SidePanelNavbar } from '../../../../components/Layout/PayrollSidePanel';

export const EmployeeDetailsPanelNavbar: FC = () => {
  const { nextNavigator, prevNavigator } =
    useEmployeeDetailsPanelStepperNavigator();

  return (
    <SidePanelNavbar
      title="Hello"
      onNext={nextNavigator()}
      onPrev={prevNavigator()}
    />
  );
};
