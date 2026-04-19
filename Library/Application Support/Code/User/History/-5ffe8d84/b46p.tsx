import { useTranslation } from 'react-i18next';

import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Dialog } from 'designSystem/component/dialog';

import { useOrgChartPreferencesContext } from '../hooks';

export const RemoveFiltersDialog = () => {
  const { closeDialog, dialogState, isDialogOfType } = useDialogContext();
  const { setFilters, setSpotlight, setFocusedEmployeeId } =
    useOrgChartPreferencesContext();

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.search.remove-filters-dialog',
  });

  const isOpen = isDialogOfType('org-chart.remove-filters', dialogState);
  const employeeId = isOpen && dialogState.data.employeeId;

  if (!employeeId) {
    return null;
  }

  return (
    <Dialog.Util
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={t('title')}
      description={t('description')}
    >
      <Dialog.Footer>
        <ActionBar>
          <Actions.Secondary variant="ghost" onClick={closeDialog}>
            {t('cancel')}
          </Actions.Secondary>
          <Actions.Primary
            onClick={() => {
              setFilters([]);
              setSpotlight('');
              setFocusedEmployeeId(employeeId);
              closeDialog();
            }}
          >
            {t('continue')}
          </Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Util>
  );
};
