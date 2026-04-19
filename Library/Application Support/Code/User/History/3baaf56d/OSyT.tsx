import { parseMetadata, suffixMetadata } from '@highlight-ui/utils-commons';
import { type ComponentMetadata } from '@personio-web/design-system-utils';

import styles from '../ViewActionsBar.module.scss';

type SeparatorProps = { metadata?: ComponentMetadata };
export const Separator = ({ metadata }: SeparatorProps) => (
  <div
    aria-orientation="vertical"
    className={styles.separator}
    role="separator"
    {...parseMetadata(suffixMetadata(metadata, 'separator'))}
  />
);
