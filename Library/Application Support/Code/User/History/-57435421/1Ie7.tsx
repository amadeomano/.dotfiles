import { Stack, Inline } from 'designSystem/component/layout';
import { type FacepileProps, Facepile } from 'designSystem/component/facepile';
import styles from './styles.module.scss';

type PayGroupProps = {
  name: string;
  employeeCount: number;
  faces: FacepileProps['items'];
};
export const PayGroup = ({ name, employeeCount, faces }: PayGroupProps) => (
  <Stack space="gap-small">
    <p className={styles.payGroupLabel}>{name}</p>
    <Inline>
      <Facepile items={faces} totalItems={employeeCount} />
      <p>{employeeCount} People</p>
    </Inline>
  </Stack>
);
