import { type ComponentMetadata } from '@personio-web/design-system-utils';

type SeparatorProps = { metadata: ComponentMetadata };
export const Separator = ({ metadata }: SeparatorProps) => (
  <div
    aria-orientation="vertical"
    className={styles.separator}
    role="separator"
    {...parseMetadata(suffixMetadata(metadata, 'separator'))}
  />
);
