import { LocalBanner } from 'designSystem/component/local-banner';
import { type Status, useParallelMode } from '../hooks/useParallelMode';

type Title = { [key in NonNullable<Status>]: string };
const title: Title = {
  IDLE: 'Legal entity in parallel run',
  LIVE_REQUESTED: 'Legal entity going live soon',
  LIVE_GRANTED: 'Congratulations! Everest Group LTD payroll is live ',
  LIVE_ACKNOWLEDGED: '',
};

const ParallelModeStatus = () => {
  const { mode, status } = useParallelMode();

  if (!mode || !status) return null;
  if (mode === 'LIVE' && status === 'LIVE_ACKNOWLEDGED') return null;

  return <LocalBanner variant="info" title={title[status]} />;
};
