import { Dialog } from 'designSystem/component/dialog';
type DocumentPreviewProps = {
  documentUrl: string;
};

export const DocumentPreview = ({ documentUrl }: DocumentPreviewProps) => (
  <object
    style={{ height: '100%', width: '100%' }}
    name="payslip"
    type="application/pdf"
    data={documentUrl}
    role="document"
  ></object>
);
