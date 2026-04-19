import React, { useCallback, useRef } from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';

import { parseMetadata } from '@personio-web/design-system-utils';
import { createSlots } from '@personio-web/design-system-utils';
import { usePanelContext } from '@personio-web/design-system-context';
import { ActionBar } from '@personio-web/design-system-component-action-bar';
import type { DrawerProps } from '@personio-web/design-system-component-panel';

import { Content } from './components/Content/Content';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import { DrawerContext } from '../hooks';
import { getPanelMotion } from '../utils/getPanelMotion';

import styles from './Drawer.module.scss';

export const DRAWER_ERROR_MESSAGE =
  'Please provide only children of the following types: `Drawer.NavigationBar, Drawer.Content & ActionBar`';

const Drawer = ({ children, metadata, drawerRef }: DrawerProps) => {
  const { onPanelOpenChange } = usePanelContext();
  const defaultDrawerRef = useRef(null);
  const currentDrawerRef = drawerRef || defaultDrawerRef;

  const { slots, rest: nonMatchedComponents } = createSlots(children, {
    navigationBar: NavigationBar,
    content: Drawer.Content,
    actionBar: ActionBar,
  });

  if (nonMatchedComponents.length > 0) {
    throw new Error(DRAWER_ERROR_MESSAGE);
  }

  const { initial, animate, exit, panelWidth } = getPanelMotion();

  const avoidCloseOnOutsideEvent = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  return (
    <DrawerContext.Provider value={{ drawerRef: currentDrawerRef }}>
      <RadixDialog.Root
        open
        onOpenChange={onPanelOpenChange}
        modal={false}
        {...parseMetadata(metadata)}
      >
        <RadixDialog.Content
          onInteractOutside={avoidCloseOnOutsideEvent}
          onPointerDownOutside={avoidCloseOnOutsideEvent}
          asChild
        >
          <motion.div
            className={styles.drawer}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={{
              initial: initial(panelWidth),
              animate: animate(panelWidth),
              exit,
            }}
          >
            {slots.navigationBar}
            {slots.content}
            {slots.actionBar ? (
              <div className={styles.actionBar}>{slots.actionBar}</div>
            ) : null}
          </motion.div>
        </RadixDialog.Content>
      </RadixDialog.Root>
    </DrawerContext.Provider>
  );
};

Drawer.Content = Content;
Drawer.NavigationBar = NavigationBar;

export { Drawer };
