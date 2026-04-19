import { LocalBanner } from 'designSystem/component/local-banner';
import { useParallelMode } from '../hooks/useParallelMode';

const ParallelModeStatus = () => {
  const { mode, status } = useParallelMode();

  if (!mode || !status) return null;
  if (mode === 'LIVE' && status === 'LIVE_ACKNOWLEDGED') return null;

  return <LocalBanner />;
};
