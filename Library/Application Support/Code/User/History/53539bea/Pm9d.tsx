import React from 'react';
import { useRouter } from 'next/router';
import useIntegrationSettings from '../../../../shared/hooks/useIntegrationSettings';
import { PayrollIntegration } from '../../../../shared/types/PayrollIntegration';

import styles from './PageContent.module.scss';
import { getParams } from '../../../../shared/utils/navigationParams';

const PageContent: React.FC<
  React.PropsWithChildren<{ integration: PayrollIntegration }>
> = ({ integration }) => {
  const router = useRouter();
  const { legalEntityId } = getParams(router.query);
  const { Component } = useIntegrationSettings(integration);
  const canRenderSettings = !!legalEntityId;
  console.log(router);

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
