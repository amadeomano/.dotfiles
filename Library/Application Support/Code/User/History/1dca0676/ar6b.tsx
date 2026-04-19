import { type PropsWithChildren, type FC, type ReactElement } from 'react';
import { Slot } from 'designSystem/component/slot';
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
