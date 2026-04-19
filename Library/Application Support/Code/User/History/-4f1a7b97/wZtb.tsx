import React from 'react';

import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { Button } from 'designSystem/component/button';
import { Link } from 'designSystem/component/link';
import { Tooltip } from 'designSystem/component/tooltip';

import { FeatureFlags } from '../../../constants';
import { useListFilteredOpenPositions } from '../../../hooks';
import { TestIds } from '../../../utils';
import {
  getItemWithExpireDate,
  setItemWithExpireDate,
} from '../../../utils/localStorageWithExpireDate';

import styles from './OpenPositionsWithoutSupervisorButton.module.scss';

export const openTooltipByDefaultKey =
  'eo.orgChart.openPositions.openTooltipByDefault';

export const OpenPositionsWithoutSupervisorButton = () => {
  const { isOn, isReady } = useFeatureFlag(
    FeatureFlags.ENABLE_REDESIGN_ORG_CHART_CONTROLBAR,
  );
  const isActionBarRedesignEnabled = isOn && isReady;

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.open-positions-without-supervisor.tooltip',
  });

  const { totalSize: openPositionsWithoutSupervisorCount } =
    useListFilteredOpenPositions({
      filters: [
        {
          id: 'target_supervisor_id',
          value: {
            value: undefined,
            condition: 'is_empty',
          },
        },
      ],
      pageSize: 1,
    });

  const openTooltipByDefault = getItemWithExpireDate(
    openTooltipByDefaultKey,
    true,
  );

  if (!openPositionsWithoutSupervisorCount) {
    return null;
  }

  const title = t('title', { count: openPositionsWithoutSupervisorCount });

  return (
    <Tooltip
      content={
        <>
          <strong>{title}</strong>
          <div>{t('sub-title')}</div>
        </>
      }
      defaultOpen={openTooltipByDefault}
      className={styles.tooltip}
      onOpenChange={() => {
        if (openTooltipByDefault) {
          setItemWithExpireDate(openTooltipByDefaultKey, false);
        }
      }}
    >
      <div className={styles.triggerWrapper}>
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href="/workforce-planning/positions"
          onClick={(e) => e.stopPropagation()}
          aria-label={title}
          metadata={{ testId: TestIds.OpenPositionsWithoutSupervisor }}
          unstyled={true}
        >
          <Button
            variant="ghost"
            className={styles.trigger}
            icon={BriefcaseSlashIcon}
            aria-label={title}
          >
            {String(openPositionsWithoutSupervisorCount)}
          </Button>
        </Link>
      </div>
    </Tooltip>
  );
};

export const BriefcaseSlashIcon = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<'svg'>
>(({ height, width, fill = 'currentColor', ...otherProps }, ref) => (
  <svg
    role="img"
    height={height}
    width={width}
    ref={ref}
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    {...otherProps}
    fill="none"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.9002 3.58544C12.6168 2.66721 11.7613 2 10.75 2H9.25C8.00736 2 7 3.00736 7 4.25V5H4.75C3.50736 5 2.5 6.00736 2.5 7.25V9.75V13.9857L4 12.4857V10.5H5.98569L7.48569 9H6.75H4V7.25C4 6.83579 4.33579 6.5 4.75 6.5H9.98569L11.4857 5H8.5V4.25C8.5 3.83579 8.83579 3.5 9.25 3.5H10.75C11.1642 3.5 11.5 3.83579 11.5 4.25V4.98569L12.9002 3.58544ZM14.3141 5L12.8141 6.5H15.25C15.6642 6.5 16 6.83579 16 7.25V9H13.25H10.3141L8.81412 10.5H12.5V11.25C12.5 11.6642 12.8358 12 13.25 12C13.6642 12 14 11.6642 14 11.25V10.5H16V14.75C16 15.1642 15.6642 15.5 15.25 15.5H4.75C4.49542 15.5 4.27047 15.3732 4.13489 15.1792L3.06877 16.2453C3.48088 16.7084 4.08138 17 4.75 17H15.25C16.4926 17 17.5 15.9926 17.5 14.75V7.25C17.5 6.00736 16.4926 5 15.25 5H14.3141Z"
      fill={fill}
    />
    <path
      d="M2.5 17.5L17.5 2.5"
      stroke={fill}
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
));
