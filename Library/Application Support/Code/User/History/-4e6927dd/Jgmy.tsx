import { Children, isValidElement } from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixDialog from '@radix-ui/react-dialog';

import { IconButton } from '@personio-web/design-system-component-button';
import { icons } from '@personio-web/design-system-component-icon';
import { Inline } from '@personio-web/design-system-component-layout';
import {
  AccessoryCenter,
  AccessoryLeft,
  AccessoryRight,
  NavigationBarBase,
} from '@personio-web/design-system-component-navigation-bar-base';
import type { PanelNavigationBarProps } from '@personio-web/design-system-component-panel';

import { Action } from '../../../commons/components/NavigationBar/Action/Action';
import { Title } from '../../../commons/components/NavigationBar/Title/Title';
import { useDrawerContext } from '../../../hooks';
import { useScrolledData } from '../../../utils/useScrolledData';

import styles from './NavigationBar.module.scss';

export const NAVIGATION_ERROR_MESSAGE =
  'Please provide children of type Stepper, IconButtonGroup or MoreActions & no more than 3 children';

const NavigationBar = ({ children, title }: PanelNavigationBarProps) => {
  const { drawerRef } = useDrawerContext();
  const { t } = useTranslation('design-system', {
    useSuspense: false,
  });

  const { isSticky } = useScrolledData(drawerRef);

  return (
    <NavigationBarBase isSticky={isSticky}>
      <AccessoryLeft>
        <RadixDialog.Close asChild>
          <IconButton
            icon={icons.crossLarge}
            aria-label={t('panel.drawer.navigation-bar.close-aria-label')}
            variant="ghost"
          />
        </RadixDialog.Close>
      </AccessoryLeft>
      <AccessoryCenter>
        <div className={styles.titleContainer}>
          <RadixDialog.Title asChild>
            {title && <Title>{title}</Title>}
          </RadixDialog.Title>
        </div>
      </AccessoryCenter>
      <AccessoryRight>
        <Inline space="gap-xsmall">
          {Children.map(children, (child) => {
            if (!isValidElement(child)) {
              return null;
            }

            if (!isValidElement(child) || Children.count(children) > 3) {
              throw new Error(NAVIGATION_ERROR_MESSAGE);
            }
            switch (child.type) {
              case Action.IconButton:
              case Action.Stepper:
              case Action.More:
                return child;
              default:
                throw new Error(NAVIGATION_ERROR_MESSAGE);
            }
          })}
        </Inline>
      </AccessoryRight>
    </NavigationBarBase>
  );
};
NavigationBar.displayName = 'Drawer.NavigationBar';

export { NavigationBar };
