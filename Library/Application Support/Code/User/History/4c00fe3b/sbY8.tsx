import { Dialog } from 'designSystem/component/dialog';

type DocumentPreviewProps = {
  documentUrl: string | null;
  onClose: () => void;
};

export const DocumentPreview = ({
  documentUrl,
  onClose,
}: DocumentPreviewProps) => (
  <Dialog.Promo open={documentUrl !== null} onOpenChange={onClose}>
    <Dialog.NavigationBar />
    <Dialog.Content>
      {documentUrl && (
        <object
          style={{ height: '100%', width: '100%' }}
          name="payslip"
          type="application/pdf"
          data={documentUrl}
          role="document"
        ></object>
      )}
    </Dialog.Content>
    <Dialog.Footer children />
  </Dialog.Promo>
);
