import { type PropsWithChildren } from 'react';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Action, Dialog } from 'designSystem/component/dialog';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { icons } from 'designSystem/component/icon';

export type ReportModalProps = {
  title: string;
  onClose?: () => void;
  downloadCSVAction?: () => void;
};

export const ReportModal = ({
  children,
  onClose,
  title,
  downloadCSVAction,
}: PropsWithChildren<ReportModalProps>) => {
  return (
    <Dialog.Promo open onOpenChange={onClose}>
      <Dialog.NavigationBar title={title}>
        {downloadCSVAction && (
          <Action.More>
            <DropdownMenu.Item
              icon={icons.rectangleHorizontalArrowDown}
              name="Download CSV"
              onSelect={downloadCSVAction}
            />
            {/* Additional download formats will go here */}
          </Action.More>
        )}
      </Dialog.NavigationBar>
      <Dialog.Content>{children}</Dialog.Content>
      <Dialog.Footer>
        <ActionBar>
          {/* Default download format will be exposed here in addition to dropdown in header */}
          {downloadCSVAction && (
            <Actions.Secondary
              disabled={false}
              variant="ghost"
              onClick={downloadCSVAction}
            >
              Download CSV
            </Actions.Secondary>
          )}
          <Actions.Primary onClick={onClose}>Close</Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Promo>
  );
};
