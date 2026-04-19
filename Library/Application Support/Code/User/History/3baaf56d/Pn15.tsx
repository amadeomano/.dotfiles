export const Separator = () => (
  <div
    aria-orientation="vertical"
    className={styles.separator}
    role="separator"
    {...parseMetadata(suffixMetadata(metadata, 'separator'))}
  />
);
