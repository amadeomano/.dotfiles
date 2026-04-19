import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { Button } from 'designSystem/component/button';
import { icons } from 'designSystem/component/icon';
import { Tooltip } from 'designSystem/component/tooltip';

import { FeatureFlags } from '../../../constants';
import { Dialogs } from '../../../constants/dialogs';
import { useOrgChartPreferencesContext } from '../../../contexts';
import { useHasInclusionsAccess } from '../../../hooks';
import { TestIds } from '../../../utils';

import styles from './HiddenCardsTrigger.module.scss';

export interface HiddenCardsTriggerProps {
  hiddenCardsCount?: number;
}

const OrgUnitTooltip = ({
  children,
  hiddenCardsCount,
}: React.PropsWithChildren<HiddenCardsTriggerProps>) => {
  const prefs = useOrgChartPreferencesContext();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.org-units.tooltip',
  });

  if (prefs.source === 'Supervisor') return children;

  return (
    <Tooltip
      delayDuration={0}
      content={t(
        prefs.source === 'Department' ? 'hidden_departments' : 'hidden_teams',
        { count: hiddenCardsCount },
      )}
    >
      {children}
    </Tooltip>
  );
};

export const HiddenCardsTrigger = ({
  hiddenCardsCount = 0,
}: HiddenCardsTriggerProps) => {
  const { isOn, isReady } = useFeatureFlag(
    FeatureFlags.ENABLE_REDESIGN_ORG_CHART_CONTROLBAR,
  );
  const isActionBarRedesignEnabled = isOn && isReady;

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.other-employees-drawer',
  });

  const { isDialogOfType, dialogState, openDialog, closeDialog } =
    useDialogContext();
  const isOpen = isDialogOfType(Dialogs.OTHER_EMPLOYEES, dialogState);

  const prefs = useOrgChartPreferencesContext();
  const isSupervisorSource = prefs.source === 'Supervisor';

  const hasInclusionsAccess = useHasInclusionsAccess();

  if (!hiddenCardsCount || !hasInclusionsAccess) {
    return null;
  }

  const handleClick = isSupervisorSource
    ? () => (isOpen ? closeDialog() : openDialog(Dialogs.OTHER_EMPLOYEES, {}))
    : undefined;

  return (
    <div
      className={classnames(styles.triggerWrapper, {
        [styles.redesignedTriggerWrapper]: isActionBarRedesignEnabled,
      })}
    >
      <OrgUnitTooltip hiddenCardsCount={hiddenCardsCount}>
        <Button
          variant="ghost"
          icon={icons.eyeSlash}
          className={styles.trigger}
          aria-label={t('excluded-title')}
          onClick={handleClick}
          metadata={{ testId: TestIds.OtherEmployeesTrigger }}
        >
          {String(hiddenCardsCount)}
        </Button>
      </OrgUnitTooltip>
    </div>
  );
};
