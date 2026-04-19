type DocumentPreviewProps = {
  documentUrl: string;
};

export const DocumentPreview = ({ documentUrl }: DocumentPreviewProps) => (
  <object
    style={{ height: '100%', width: '100%' }}
    data-test-id="document-preview-object"
    name="payslip"
    type="application/pdf"
    data={documentUrl}
    role="document"
  ></object>
);
