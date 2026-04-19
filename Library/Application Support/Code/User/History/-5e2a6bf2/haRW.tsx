import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { Slot } from '@personio-web/design-system-utils/src/Slot/Slot';
import { Action, Drawer } from 'designSystem/component/panel';

type SidePanelNavbarProps = {
  title?: string;
  onNext?: () => void;
  onPrev?: () => void;
};
export const SidePanelNavbar: FC<SidePanelNavbarProps> = ({
  title,
  onNext,
  onPrev,
}) => (
  <Drawer.NavigationBar title={title}>
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
  </Drawer.NavigationBar>
);
SidePanelNavbar.displayName = 'SidePanelNavbar';

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
