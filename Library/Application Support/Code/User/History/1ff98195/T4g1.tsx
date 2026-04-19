import React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import { useControllableState } from '@radix-ui/react-use-controllable-state';

import { suffixMetadata } from '@personio-web/design-system-utils';
import type { PopoverProps } from '@personio-web/design-system-component-popover';

import { PopoverClose } from './Close';
import { PopoverContent } from './Content';
import { PopoverTrigger } from './Trigger';

export const POPOVER_WARNING_MESSAGE =
  'Please provide only 2 children of the following types: `Popover.Trigger` and `Popover.Content`';

export const PopoverContext = React.createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}>({ open: false, setOpen: () => {} });

const Popover = ({ children, metadata, ...props }: PopoverProps) => {
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const [open = false, setOpen] = useControllableState({
    prop: props.open,
    defaultProp: props.defaultOpen,
    onChange: props.onOpenChange,
  });

  if (React.Children.count(children) > 2) {
    console.warn(POPOVER_WARNING_MESSAGE);
    return null;
  }

  return (
    <PopoverContext.Provider value={{ open, setOpen }}>
      <RadixPopover.Root {...props} open={open} onOpenChange={setOpen}>
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) {
            console.warn(POPOVER_WARNING_MESSAGE);
            return null;
          }

          switch (child.type) {
            case PopoverTrigger:
              return React.cloneElement(child as React.ReactElement, {
                metadata: suffixMetadata(metadata, 'trigger'),
                ref: triggerRef,
              });

            case PopoverContent:
              return React.cloneElement(child as React.ReactElement, {
                metadata: suffixMetadata(metadata, 'content'),
              });

            default:
              console.warn(POPOVER_WARNING_MESSAGE);
              return null;
          }
        })}
      </RadixPopover.Root>
    </PopoverContext.Provider>
  );
};

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;
Popover.Close = PopoverClose;

export { Popover };
