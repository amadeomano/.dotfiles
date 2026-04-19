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

interface ConditionalTooltipProps {
  children: React.ReactNode;
  showTooltip: boolean;
  content: string;
}

const OrgUnitTooltip = ({
  children,
  showTooltip,
  content,
}: ConditionalTooltipProps) => {
  if (showTooltip) {
    return <Tooltip content={content}>{children}</Tooltip>;
  }
  return children;
};

export interface HiddenCardsTriggerProps {
  hiddenCardsCount?: number;
}

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

  const prefs = useOrgChartPreferencesContext();
  const isSupervisorSource = prefs.source === 'Supervisor';

  const { isDialogOfType, dialogState, openDialog, closeDialog } =
    useDialogContext();

  const isOpen = isDialogOfType(Dialogs.OTHER_EMPLOYEES, dialogState);

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
      <OrgUnitTooltip
        showTooltip={!isSupervisorSource}
        content="This feature is only available in Supervisor view"
      >
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
