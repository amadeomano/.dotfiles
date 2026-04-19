import { Stack, Inline } from 'designSystem/component/layout';
import { PersonioSpinner } from '../../../../../../../components/PersonioSpinner/PersonioSpinner';
import styles from './styles.module.scss';
import { Inline } from '@personio-web/design-system-component-layout-types';

export const LoadingScreen = () => (
  <Stack>
    <Inline align="center">
      <PersonioSpinner loading />
    </Inline>
    <h6>Approving payrun...</h6>
    <p>This might take a few moments</p>
  </Stack>
);
