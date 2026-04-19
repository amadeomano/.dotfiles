import React from 'react';
import { Button } from 'designSystem/component/button';
import { useRouter } from 'next/router';
import { InlineBanner } from '@personio-web/payroll-component-inline-banner';
import { useTranslation } from 'react-i18next';
import { TRANSLATION_NAMESPACE } from '../../../../constants';
import { getParams } from '../../../../utils/navigationParams';

type ConfigurationAlertProps = {
  title: string;
};
const ConfigurationAlert: React.FC<ConfigurationAlertProps> = ({ title }) => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'xero.hub.configuration-alerts',
  });
  const router = useRouter();
  const {
    params: { legalEntityId },
  } = usePayrollHubNavigator();

  const goToSettings = () => {
    router.push(
      `/configuration/payroll-integration/xero?legalEntityId=${legalEntityId}`,
    );
  };

  return (
    <InlineBanner
      variant="warning"
      title={title}
      action={
        <Button onClick={goToSettings}>
          {t('continue-in-settings-button')}
        </Button>
      }
    />
  );
};

export default ConfigurationAlert;

export const UnauthorizedAlert = () => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'xero.hub.configuration-alerts',
  });

  return <ConfigurationAlert title={t('unauthorized-title')} />;
};

export const NoCalendarAssignedAlert = () => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'xero.hub.configuration-alerts',
  });

  return <ConfigurationAlert title={t('no-calendar-assigned-title')} />;
};
