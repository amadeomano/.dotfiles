import { PayrollIntegration } from '../../../../shared/types/PayrollIntegration';
import { customRender } from '../../../../test-setup/testUtils';
import PageContent from './PageContent';
import { FeatureFlag } from '../../../../shared/types/FeatureFlag';

jest.mock('next/router', () => require('next-router-mock'));

describe('<PageContent/>', () => {
  it('should have the expected xero federated module', async () => {
    const { renderResult: view } = customRender(
      <PageContent integration={PayrollIntegration.Xero} />,
      {
        initialEntries: ['?legalEntityId=1'],
        featureFlags: {
          [FeatureFlag.EnableNorthstarXeroSettings]: 'on',
        },
      },
    );

    await expect(view).toHaveFederatedModule({
      remote: 'payroll',
      module: './view/xero-settings',
    });
  });

  it('should have the expected a3 federated module', async () => {
    const { renderResult: view } = customRender(
      <PageContent integration={PayrollIntegration.A3} />,
      {
        initialEntries: ['?legalEntityId=1'],
      },
    );

    await expect(view).toHaveFederatedModule({
      remote: 'payroll',
      module: './view/a3-settings',
    });
  });
});
