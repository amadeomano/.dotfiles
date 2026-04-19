export const Separator = useCallback(
  () => (
    <div
      aria-orientation="vertical"
      className={styles.separator}
      role="separator"
      {...parseMetadata(suffixMetadata(metadata, 'separator'))}
    />
  ),
  [metadata],
);
