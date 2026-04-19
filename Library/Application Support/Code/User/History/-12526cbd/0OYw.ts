import type { FeatureFlag } from '../../../../../featureFlags';

export const FeatureFlags: Record<string, FeatureFlag> = {
  ENABLE_LOKET: 'PAYINT-7643-enable-loket-payroll',
  ENABLE_DATEV_PAYROLL_O11: 'PAYINT-6955-DATEV-O11',
  ENABLE_SURGE_O11: 'PAYINT-7883-migrate-surge',
};
