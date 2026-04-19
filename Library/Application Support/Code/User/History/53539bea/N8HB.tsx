import React from 'react';
import useIntegrationSettings from '../../../../shared/hooks/useIntegrationSettings';
import { PayrollIntegration } from '../../../../shared/types/PayrollIntegration';

import styles from './PageContent.module.scss';
import { usePayrollIntegrationSettingsNavigator } from 'payroll/hook/use-payroll-integration-navigator';
import { getParams } from '../../../../shared/utils/navigationParams';

const PageContent: React.FC<
  React.PropsWithChildren<{ integration: PayrollIntegration }>
> = ({ integration }) => {
  const {
    params: { legalEntityId },
  } = usePayrollIntegrationSettingsNavigator(integration);
  const { Component } = useIntegrationSettings(integration);
  const canRenderSettings = !!legalEntityId;

  return (
    <div className={styles.page}>
      <div
        className={styles.integrationPage}
        id={`${integration}-settings-page`}
      >
        {canRenderSettings && <Component />}
      </div>
    </div>
  );
};

export default PageContent;
