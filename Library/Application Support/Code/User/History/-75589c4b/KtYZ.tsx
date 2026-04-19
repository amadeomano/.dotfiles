import { PersonioSpinner } from '../../../../../../../components/PersonioSpinner/PersonioSpinner';
import styles from './styles.module.scss';

export const LoadingScreen = () => (
  <div>
    <div className={styles.spinner}>
      <PersonioSpinner loading />
    </div>
    <Heading variant="small" as="h6">
      Approving payrun...
    </Heading>
    <Body>This might take a few moments</Body>
  </div>
);
