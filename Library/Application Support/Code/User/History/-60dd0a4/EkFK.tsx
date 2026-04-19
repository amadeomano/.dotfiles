import { useTranslation } from 'react-i18next';

import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { Dialog } from 'designSystem/component/dialog';

export const ExportLimitationSafariDialog = () => {
  const { closeDialog, dialogState, isDialogOfType } = useDialogContext();

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.export-limitation-safari',
  });

  const isOpen = isDialogOfType(
    'org-chart.export-limitation-safari',
    dialogState,
  );
  const isSafari =
    navigator.userAgent.includes('Safari') &&
    !navigator.userAgent.includes('Chrome');

  if (!isSafari) {
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
