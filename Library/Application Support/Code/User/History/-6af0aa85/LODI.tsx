import { useTranslation } from 'react-i18next';
import { type ParseKeys, type TOptions } from 'i18next';

import { SavedViews } from 'designSystem/component/saved-views';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';

import { FeatureFlags } from '../../../constants/featureFlags';
import { useOrgChartPreferencesContext } from '../../../contexts';
import { type Source } from '../../../sources/preferences/types';
import { OrgUnitSavedViews } from './OrgUnitSavedViews';
import { SupervisorSavedViews } from './SupervisorSavedViews';

const sourceOptions: Record<
  Source,
  ParseKeys<
    'employees-organizations',
    TOptions,
    'org-chart.control-bar.source-switcher'
  >
> = {
  Supervisor: 'people',
  Department: 'departments',
  Team: 'teams',
};

const SavedViewsMenu = () => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.saved-views',
  });
  const { t: tSourceSwitcher } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.source-switcher',
  });

  const orgUnitsFF = useFeatureFlag(FeatureFlags.ENABLE_ORG_UNITS_IN_ORG_CHART);
  const isOrgUnitFFActive = orgUnitsFF.isOn && orgUnitsFF.isReady;

  const prefs = useOrgChartPreferencesContext();

  const dialogContext = useDialogContext();
  const {
    state: orgUnitDetailsState,
    setStateWithCallback: setOrgUnitDetailsStateWithCallback,
  } = useOrgUnitDetailsState();

  return (
    <SavedViews.Menu>
      <SupervisorSavedViews />
      {isOrgUnitFFActive && <OrgUnitSavedViews />}
      {isOrgUnitFFActive && (
        <SavedViews.MenuHeader>{t('arrange-by-section')}</SavedViews.MenuHeader>
      )}
      {isOrgUnitFFActive &&
        Object.entries(sourceOptions).map(([source, label]) => (
          <SavedViews.MenuItem
            key={source}
            selected={prefs.source === source}
            onClick={() => {
              const callback = () => {
                prefs.setSource(source as Source);
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
          >
            {tSourceSwitcher(label)}
          </SavedViews.MenuItem>
        ))}
    </SavedViews.Menu>
  );
};

export default SavedViewsMenu;
