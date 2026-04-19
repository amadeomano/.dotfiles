import { Inline, Stack } from 'designSystem/component/layout';
import { Icon, icons } from 'designSystem/component/icon';
import { usePayrunApprovalNavigator } from '../../../hooks/usePayrunApprovalNavigator';
import styles from './styles.module.scss';

export const ConfirmationScreen = () => {
  const { navigateToDocumentsTab } = usePayrunApprovalNavigator();
  return (
    <Stack>
      <Inline align="center">
        <div className={styles.feedbackIconWrapper}>
          <Icon
            size="huge"
            icon={icons.checkmarkCircleFilled}
            color="disabled-positive"
          />
        </div>
      </Inline>
      <div className={styles.feedbackTitle}>
        <h6>All done!</h6>
      </div>
      <Body>Payrun succesfully approved</Body>
      <Button
        className={styles.documentsButton}
        variant="default"
        onClick={navigateToDocumentsTab}
      >
        View documents
      </Button>
    </Stack>
  );
};
