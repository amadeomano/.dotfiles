import type { ReactNode } from 'react';
import { Sidepanel } from '@personio-web/payroll-component-sidepanel';

import { BasicEmployeeSidepanelHeader } from './BasicEmployeeSidepanelHeader/BasicEmployeeSidepanelHeader';
import { BasicEmployeeSidepanelContent } from '../../integrations/preliminary/components/BasicEmployeeSidepanelContent/BasicEmployeeSidepanelContent';
import styles from './BasicEmployeeSidepanel.module.scss';
type BasicEmployeeSidepanelFeatureProps = {
  employeeId?: string;
  options?: {
    controls: {
      moveForward?: {
        enabled: boolean;
      };
      moveBack?: {
        enabled: boolean;
      };
      redirect?: {
        enabled: boolean;
      };
    };
    actions: {
      onMoveForward?: () => void;
      onMoveBack?: () => void;
      onRedirect?: () => void;
    };
  };
  onClose: () => void;
  children?: ReactNode;
};

export const BasicEmployeeSidepanel = ({
  options,
  employeeId,
  onClose,
}: BasicEmployeeSidepanelFeatureProps) => {
  const visibility = employeeId ? 'show' : 'hide';

  return (
    <Sidepanel
      visibility={visibility}
      onClose={onClose}
      className={styles.sidepanelContainer}
    >
      <Sidepanel.Controls
        options={{
          moveBack: {
            enabled: !!options?.controls.moveBack?.enabled,
            action: options?.actions.onMoveBack,
          },
          moveForward: {
            enabled: !!options?.controls.moveForward?.enabled,
            action: options?.actions.onMoveForward,
          },
        }}
      />
      <Sidepanel.Header>
        <BasicEmployeeSidepanelHeader />
      </Sidepanel.Header>
      <Sidepanel.Content>
        <BasicEmployeeSidepanelContent />
      </Sidepanel.Content>
    </Sidepanel>
  );
};
