const DocumentPreview = () => (
  <object
    style={{ height: '100%', width: '100%' }}
    data-test-id="document-preview-object"
    name="payslip"
    type="application/pdf"
    data={getPreviewUrl()}
    role="document"
  >
    <div className={styles.contentWrapper}>
      <EmptyState
        icon={icons.exclamationMarkTriangle}
        title={t('features.document-preview.fallback.title')}
        description={t('features.document-preview.fallback.description')}
        primaryButton={{
          children: t('features.document-preview.fallback.download'),
          icon: icons.rectangleHorizontalArrowDown,
          onClick: () => onDownloadFile(),
        }}
      />
    </div>
  </object>
);
