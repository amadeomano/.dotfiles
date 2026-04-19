import { Body, Heading } from '@highlight-ui/typography';
import { Icon, icons } from 'designSystem/component/icon';
import { Button } from 'designSystem/component/button';
import { Inline, Stack } from 'designSystem/component/layout';

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
        <Heading variant="small" as="h6">
          All done!
        </Heading>
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

export const ErrorScreen = ({ retryHandler }: { retryHandler: () => void }) => (
  <Stack>
    <Inline align="center">
      <div className={styles.feedbackIconWrapper}>
        <Icon
          size="huge"
          icon={icons.exclamationMarkTriangleFilled}
          color="disabled-negative"
        />
      </div>
    </Inline>
    <div className={styles.feedbackTitle}>
      <Heading variant="small" as="h5">
        Something went wrong
      </Heading>
    </div>
    <Body>
      We encountered a problem approving payroll. Please try again or contact
      support if the issue persists.
    </Body>
    <Inline align="center">
      <Button
        className={styles.documentsButton}
        variant="default"
        onClick={retryHandler}
      >
        Try again
      </Button>
    </Inline>
  </Stack>
);
