import type { Dialogs } from '@personio-web/employees-organizations-hook-use-dialog-context/src/types';

export type UseDrawerReturn<
  T extends keyof Dialogs | unknown,
  U,
> = T extends keyof Dialogs
  ? {
      isOpen: boolean;
      data?: Dialogs[T];
      close: () => void;
      Drawer: U;
    }
  : {
      isOpen: boolean;
      data?: T;
      close: () => void;
      Drawer: U;
    };
