import { type IconSVGComponent } from 'designSystem/component/icon';
import {
  type LocalBannerProps,
  LocalBanner,
} from 'designSystem/component/local-banner';
import {
  type Status,
  type Mode,
  useParallelMode,
} from '../hooks/useParallelMode';

type State = { [key in NonNullable<Status>]: string };
type Variant = { [key in NonNullable<Mode>]: LocalBannerProps['variant'] };
type Icon = { [key in NonNullable<Mode>]: IconSVGComponent };

const variant: Variant = {
  LIVE: 'success',
  PARALLEL: 'info',
};
const title: State = {
  IDLE: 'Legal entity in parallel run',
  LIVE_REQUESTED: 'Legal entity going live soon',
  LIVE_GRANTED: 'Congratulations! Everest Group LTD payroll is live ',
  LIVE_ACKNOWLEDGED: '',
};
const body: State = {
  IDLE: 'Try and compare Personio Payroll with your current payroll provider using real data. No documents will be distributed and no data will be reported to third parties',
  LIVE_REQUESTED:
    'Support team will be in touch to confirm that everything is ready',
  LIVE_GRANTED:
    'Once you approve a payroll run we’ll distribute documents to employees and report data to HMRC',
  LIVE_ACKNOWLEDGED: '',
};

const ParallelModeStatus = () => {
  const { mode, status } = useParallelMode();

  if (!mode || !status) return null;
  if (mode === 'LIVE' && status === 'LIVE_ACKNOWLEDGED') return null;

  return (
    <LocalBanner variant="info" title={title[status]} body={body[status]} />
  );
};
