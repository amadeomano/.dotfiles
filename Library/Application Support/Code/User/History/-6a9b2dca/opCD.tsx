import { LocalBanner } from 'designSystem/component/local-banner';
import {
  type Mode,
  type Status,
  useParallelMode,
} from '../hooks/useParallelMode';

type Stauts = { [key in NonNullable<Status>]: string };
const title: Status = {};

const ParallelModeStatus = () => {
  const { mode, status } = useParallelMode();

  if (!mode || !status) return null;
  if (mode === 'LIVE' && status === 'LIVE_ACKNOWLEDGED') return null;

  return <LocalBanner variant="info" title="" />;
};
