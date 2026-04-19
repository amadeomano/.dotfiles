import { useTranslation } from 'react-i18next';
import { type TFunction } from 'i18next';

import { Controls } from 'designSystem/component/control-bar';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { type IconSVGComponent, icons } from 'designSystem/component/icon';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';

import { FeatureFlags } from '../../../constants/featureFlags';
import { type Source } from '../../../sources/preferences/types';
import { useOrgChartPreferencesContext } from '../../../contexts/useOrgChartPreferences';
import { toTranslate } from '../../../toTranslate';
import styles from './SourceSwitcher.module.scss';

export const SOURCE_SWITCHER_TEST_ID = 'org-chart-data-source-switcher';

type SourceOption = {
  label: TFunction<
    'employees-organizations',
    'org-chart.control-bar.source-switcher'
  >;
  icon: IconSVGComponent;
};

const sourceOptions: Record<Source, SourceOption> = {
  Supervisor: {
    label: toTranslate.orgChart.controlBar.sourceSwitcher.people,
    icon: icons.people2,
  },
  Department: {
    label: toTranslate.orgChart.controlBar.sourceSwitcher.departments,
    icon: icons.personCircle,
  },
  Team: {
    label: toTranslate.orgChart.controlBar.sourceSwitcher.teams,
    icon: icons.circles2Overlapping,
  },
};

export const SourceSwitcher = () => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.source-switcher',
  });
  const prefs = useOrgChartPreferencesContext();

  const dialogContext = useDialogContext();
  const {
    state: orgUnitDetailsState,
    setStateWithCallback: setOrgUnitDetailsStateWithCallback,
  } = useOrgUnitDetailsState();

  const { isOn: isOrgUnitsFFOn, isReady: isOrgUnitsFFReady } = useFeatureFlag(
    FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART,
  );

  if (!isOrgUnitsFFOn || !isOrgUnitsFFReady) {
    return null;
  }

  return (
    <Controls.Primary
      label={t('', { defaultValue: sourceOptions[prefs.source]?.label })}
      icon={null as never}
      className={styles.trigger}
      metadata={{ testId: SOURCE_SWITCHER_TEST_ID }}
    >
      <DropdownMenu.SubTitle>
        {t('', {
          defaultValue: toTranslate.orgChart.controlBar.sourceSwitcher.subtitle,
        })}
      </DropdownMenu.SubTitle>
      {Object.entries(sourceOptions).map(([src, option]) => (
        <DropdownMenu.Item
          id={src}
          name={t('', { defaultValue: option.label })}
          icon={option.icon}
          selected={src === prefs.source}
          onSelect={() => {
            const callback = () => {
              prefs.setSource(src as Source);
              prefs.viewportState.requestNewState({
                mode: 'resetViewport',
                animated: true,
              });
            };

            if (dialogContext.dialogState)
              dialogContext.closeDialogWithCallback(callback);
            else if (orgUnitDetailsState)
              setOrgUnitDetailsStateWithCallback(null, callback);
            else callback();
          }}
        />
      ))}
    </Controls.Primary>
  );
};

SourceSwitcher.displayName = 'Controls.Dataset';
