import { Stack } from 'designSystem/component/layout';
import { PersonioSpinner } from '../../../../../../../components/PersonioSpinner/PersonioSpinner';
import styles from './styles.module.scss';

export const LoadingScreen = () => (
  <Stack>
    <div className={styles.spinner}>
      <PersonioSpinner loading />
    </div>
    <h6>Approving payrun...</h6>
    <p>This might take a few moments</p>
  </Stack>
);
