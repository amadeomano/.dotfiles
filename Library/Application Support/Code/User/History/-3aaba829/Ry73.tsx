import React from 'react';

import { parseMetadata, suffixMetadata } from '@highlight-ui/utils-commons';

import { IconButton } from 'designSystem/component/button';
import { Inline } from 'designSystem/component/layout';
import { Tooltip } from 'designSystem/component/tooltip';

import { type ViewActionsBarItemComponent } from '../../types';

import styles from './ViewActionsBarItem.module.scss';

export const ViewActionsBarItem: ViewActionsBarItemComponent = ({
  hint,
  shortcuts,
  icon,
  disabled,
  onClick,
  metadata,
}) => {
  return (
    <Tooltip
      content={
        <Inline alignVertical="center" space="gap-default">
          <span className={styles.hint}>{hint}</span>
          <Inline space="gap-xsmall" alignVertical="center">
            {shortcuts.map((shortcut) => (
              <span key={shortcut} className={styles.shortcut}>
                {shortcut}
              </span>
            ))}
          </Inline>
        </Inline>
      }
      metadata={suffixMetadata(metadata, 'tooltip')}
    >
      <IconButton
        aria-label={hint}
        variant="ghost"
        icon={icon}
        disabled={disabled}
        onClick={onClick}
        {...parseMetadata(metadata)}
      />
    </Tooltip>
  );
};
