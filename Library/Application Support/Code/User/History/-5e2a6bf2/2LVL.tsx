import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { Slot } from '@personio-web/design-system-utils/src/Slot/Slot';
import { Action, Drawer } from 'designSystem/component/panel';

type SidePanelNavbarProps = {
  title?: string;
  hasStepper?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
};
export const SidePanelNavbar: FC<SidePanelNavbarProps> = ({
  title,
  hasStepper,
  onNext,
  onPrev,
}) => (
  <Drawer.NavigationBar title={title}>
    {hasStepper && (
      <Action.Stepper
        next={{
          disabled: !onNext,
          onClick: onNext,
          'aria-label': 'Next',
        }}
        previous={{
          disabled: !onPrev,
          onClick: onPrev,
          'aria-label': 'Previous',
        }}
      />
    )}
  </Drawer.NavigationBar>
);

export type SidePanelProps = {
  isOpen: boolean;
  onClose?: () => void;
  navbar?: ReactElement<SidePanelNavbarProps>;
};
export const SidePanel = ({
  children,
  navbar,
}: PropsWithChildren<SidePanelProps>) => {
  return (
    <Drawer>
      <Slot name="Drawer.NavigationBar">{navbar}</Slot>
      <Drawer.Content>{children}</Drawer.Content>
    </Drawer>
  );
};
