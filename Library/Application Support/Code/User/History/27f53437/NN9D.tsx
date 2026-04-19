import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { Button } from 'designSystem/component/button';
import { icons } from 'designSystem/component/icon';

import { FeatureFlags } from '../../../constants';
import { Dialogs } from '../../../constants/dialogs';
import { useHasInclusionsAccess } from '../../../hooks';
import { TestIds } from '../../../utils';

import styles from './OtherPeopleTrigger.module.scss';

export interface OtherPeopleTriggerProps {
  hiddenPeopleCount?: number;
}

export const OtherPeopleTrigger = ({
  hiddenPeopleCount = 0,
}: OtherPeopleTriggerProps) => {
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

  const hasInclusionsAccess = useHasInclusionsAccess();

  if (!hiddenPeopleCount || !hasInclusionsAccess) {
    return null;
  }

  return (
    <div
      className={classnames(styles.triggerWrapper, {
        [styles.redesignedTriggerWrapper]: isActionBarRedesignEnabled,
      })}
    >
      <Button
        variant="ghost"
        icon={icons.eyeSlash}
        className={styles.trigger}
        aria-label={t('excluded-title')}
        onClick={() =>
          isOpen ? closeDialog() : openDialog(Dialogs.OTHER_EMPLOYEES, {})
        }
        metadata={{ testId: TestIds.OtherEmployeesTrigger }}
      >
        {String(hiddenPeopleCount)}
      </Button>
    </div>
  );
};
