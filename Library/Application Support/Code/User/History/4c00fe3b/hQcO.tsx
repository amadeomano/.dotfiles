type DocumentPreviewProps = {
  documentUrl: URL;
};

export const DocumentPreview = () => (
  <object
    style={{ height: '100%', width: '100%' }}
    data-test-id="document-preview-object"
    name="payslip"
    type="application/pdf"
    data={getPreviewUrl()}
    role="document"
  ></object>
);
