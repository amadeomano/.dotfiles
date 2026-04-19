import { useTranslation } from 'react-i18next';

import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { Dialog } from 'designSystem/component/dialog';

export const ExportLimitationSafariDialog = () => {
  const { closeDialog, dialogState, isDialogOfType } = useDialogContext();

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.export-limitation',
  });

  const isOpen = isDialogOfType('org-chart.export-limitation', dialogState);
  const isFirefox = navigator.userAgent.includes('Firefox');

  if (!isFirefox) {
    return null;
  }

  return (
    <Dialog.Util
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title={t('title')}
      description={t('description')}
    />
  );
};
