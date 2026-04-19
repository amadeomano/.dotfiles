import { useTranslation } from 'react-i18next';
import { type ParseKeys, type TOptions } from 'i18next';
import classNames from 'classnames';

import { Inline, Stack } from 'designSystem/component/layout';
import { Switch } from 'designSystem/component/switch';
import { Controls } from 'designSystem/component/control-bar';
import {
  Icon,
  icons,
  type IconSVGComponent,
} from 'designSystem/component/icon';

import { useAmplitude } from '@personio-web/amplitude-provider';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../../contexts';
import { TestIds } from '../../../../utils';
import { type CustomisationId } from '../../../../sources/customs/orgunit';
import * as Amp from '../../../../constants/amplitude';
import { FeatureFlags } from '../../../../constants/featureFlags';
import styles from './Customize.module.scss';

type Customisation = {
  label: ParseKeys<
    'employees-organizations',
    TOptions,
    'org-chart.org-unit-card.customisation'
  >;
  icon: IconSVGComponent;
  disabled?: boolean;
};

const getCustomisations = (
  isLeadsEnabled: boolean,
): Record<CustomisationId, Customisation> => ({
  description: {
    label: 'description',
    icon: icons.infoCircle,
  },
  layer: {
    label: 'layer',
    icon: icons.stairs,
    disabled: true,
  },
  abbreviation: {
    label: 'code',
    icon: icons.poundSign,
  },
  leads: {
    label: 'leads',
    icon: icons.person,
    disabled: !isLeadsEnabled,
  },
  totalMembers: {
    label: 'total-members',
    icon: icons.people2,
  },
  openPositions: {
    label: 'open-positions',
    icon: icons.briefcase,
    disabled: true,
  },
});

export const OrgUnitCustomize = () => {
  const { track } = useAmplitude();
  const prefs = useOrgChartPreferencesContext();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar',
  });

  return (
    <div
      role="button"
      onClick={() =>
        track(Amp.INTERACTED_CONTROL_BAR, {
          item_clicked: 'customize',
          org_chart_source: prefs.source,
        })
      }
    >
      <Controls.Custom
        label={t('cards.customize-label')}
        icon={icons.badgeIdHorizontal}
        metadata={{ testId: TestIds.ControlBarCards }}
      >
        <CustomizeMenu />
      </Controls.Custom>
    </div>
  );
};
OrgUnitCustomize.displayName = 'Controls.Custom';

const CustomizeMenu = () => {
  const prefs = useOrgChartPreferencesContext();
  const { track } = useAmplitude();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.cards.customize-cards',
  });
  const { t: tCustomisation } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.org-unit-card.customisation',
  });
  const { isOn: isLeadsEnabled } = useFeatureFlag(
    FeatureFlags.ENABLE_ORG_UNIT_LEADS,
  );

  const customisations = getCustomisations(isLeadsEnabled);

  return (
    <Stack space="gap-default" className={styles.container}>
      <Stack>
        <span>{t('nodes.title')}</span>
        <span className={styles.subtitle}>{t('nodes.sub-title')}</span>
      </Stack>

      <Stack space="gap-xlarge">
        {Object.entries(customisations)
          .filter(([_, customisation]) => !customisation.disabled)
          .map(([id, customisation]) => (
            <Inline
              space="gap-large"
              alignVertical="center"
              align="space-between"
              className={classNames({
                [styles.disabled]: customisation.disabled,
              })}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                const newState = !prefs.cardCustomisations.get(id)?.isActive;
                const activeProperties = prefs.cardCustomisations.entries
                  .filter(
                    (customization) =>
                      customization.isActive && customization.id !== id,
                  )
                  .map((customization) => customization.id);

                if (newState) {
                  activeProperties.push(id);
                }

                track(Amp.CUSTOMIZED_CARD, {
                  active_properties: activeProperties,
                  org_chart_source: prefs.source,
                });
                prefs.cardCustomisations.set(id, newState);
              }}
            >
              <Inline space="gap-default" alignVertical="center">
                <Icon
                  icon={customisation.icon}
                  size="large"
                  color="secondary"
                />
                <span>{tCustomisation(customisation.label)}</span>
              </Inline>
              <Switch
                label=""
                size="small"
                disabled={customisation.disabled}
                checked={prefs.cardCustomisations.get(id)?.isActive}
              />
            </Inline>
          ))}
      </Stack>
    </Stack>
  );
};
