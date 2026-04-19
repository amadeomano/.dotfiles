import { type FeatureFlag } from '../../../../../featureFlags';
import { FeatureFlags } from './featureFlags';

export const PayrollIntegrations = [
  'preliminary',
  'datev',
  'xero',
  'a3',
  'addison',
  'adp-spain',
  'bmd',
  'paisy',
  'sage50-payroll',
  'gb',
  'datev-lug',
  'loket',
] as const;

export enum PayrollFileExportIntegration {
  ADDISON = 'addison',
  ADP_SPAIN = 'adp-spain',
  BMD = 'bmd',
  PAISY = 'paisy',
  SAGE50 = 'sage50-payroll',
}

export type PayrollIntegrationsType = typeof PayrollIntegrations[number];

export type NormalizedIntegration = {
  id: keyof typeof PayrollIntegrationByFF;
  enabled: boolean;
};

/**
 * This abstraction represent a map between the current integrations and the FF associated to them.
 * This hook is specially important to control the release between the old and new integrations versions.
 *
 * Each key represent a payroll integration, and they must match with the returns from `v1/integrations`, `v2/context` and `?hub=gb`
 * Each value can be a string or number:
 *    If it's a string, it should represent a FF defined in the split.IO
 *    If it's a boolean:
 *      false: means that the integration is not enabled to run in the new UI
 *      true: means that the integration will be rendered in the new UI
 */
export const PayrollIntegrationByFF: Record<
  PayrollIntegrationsType,
  Readonly<boolean | FeatureFlag>
> = {
  preliminary: true,
  datev: FeatureFlags.ENABLE_DATEV_PAYROLL_O11,
  a3: true,
  'datev-lug': FeatureFlags.ENABLE_DATEV_PAYROLL_O11,
  addison: FeatureFlags.ENABLE_SURGE_O11,
  'adp-spain': FeatureFlags.ENABLE_SURGE_O11,
  bmd: FeatureFlags.ENABLE_SURGE_O11,
  loket: FeatureFlags.ENABLE_LOKET,
  paisy: FeatureFlags.ENABLE_SURGE_O11,
  'sage50-payroll': FeatureFlags.ENABLE_SURGE_O11,
  xero: true,
};
