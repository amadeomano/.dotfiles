import { type FC, type PropsWithChildren } from 'react';

export const PayrollSidePanel: FC<PropsWithChildren> = () => {
  return (
    <Drawer>
      <Slot name="Drawer.NavigationBar">{navbar}</Slot>
      <Drawer.Content>{children}</Drawer.Content>
    </Drawer>
  );
};
