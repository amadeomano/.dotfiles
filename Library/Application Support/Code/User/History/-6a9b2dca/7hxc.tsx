import { LocalBanner } from 'designSystem/component/local-banner';
import { useParallelMode } from '../hooks/useParallelMode';

const ParallelModeStatus = () => {
  const { mode, status } = useParallelMode();
  if (mode === 'LIVE') return null;
};
