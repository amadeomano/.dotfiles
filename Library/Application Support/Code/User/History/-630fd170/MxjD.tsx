import { Body, Heading } from '@highlight-ui/typography';
import { Icon, icons } from 'designSystem/component/icon';
import { Button } from 'designSystem/component/button';
import { Inline, Stack } from 'designSystem/component/layout';

import styles from './styles.module.scss';

type Props = { retryHandler: () => void };
export const ErrorScreen = ({ retryHandler }: Props) => (
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
