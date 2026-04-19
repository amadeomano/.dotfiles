import { PersonioSpinner } from '../../../../../../../components/PersonioSpinner/PersonioSpinner';
import styles from './styles.module.scss';

export const LoadingScreen = () => (
  <div>
    <div className={styles.spinner}>
      <PersonioSpinner loading />
    </div>
    <h6>Approving payrun...</h6>
    <p>This might take a few moments</p>
  </div>
);
