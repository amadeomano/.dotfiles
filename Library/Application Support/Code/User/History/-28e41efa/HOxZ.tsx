import { useAmplitude } from '@personio-web/amplitude-provider';
import { useAuthContext } from '@personio-web/auth-context';
import { icons } from 'designSystem/component/icon';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TRACK_WIDGET_CONTENT_LOAD, WIDGET_IDS } from '../../constants';
import { WidgetShell } from '@personio-web/global-experience-feature-widgetshell';
import { type TRACK_WIDGET_LOADING } from '../shared/types';
import { LoadingSkeleton } from './LoadingSkeleton/LoadingSkeleton';
import { MyOrg } from './MyOrg';
import { useMyOrganisationData } from './hooks/useMyOrganisationData';
import { useDashboardState } from '../../hooks/useDashboardContext';

export const MyOrganisationWidget = () => {
  const { t } = useTranslation('home');
  const firstLoad = useRef(true);
  const { track } = useAmplitude();
  const { data, status } = useMyOrganisationData();
  const { addWidgetReturningNull } = useDashboardState();
  const authContext = useAuthContext();
  let employeeId;
  if (authContext.entityType === 'employee') {
    employeeId = authContext.employeeId;
  }

  const isEmptyOrg =
    status === 'success' &&
    (!data ||
      // the authenticated user is also a peer
      (data.peers.length <= 1 && data.direct_reports.length <= 0));

  useEffect(() => {
    if (firstLoad.current && status !== 'loading' && status !== 'success') {
      track<TRACK_WIDGET_LOADING>(TRACK_WIDGET_CONTENT_LOAD, {
        widget: 'team org',
        widget_content_response: isEmptyOrg ? 'no_content' : status,
        overhauled_dashboard: 'true',
      });
      firstLoad.current = false;
    }
  }, [isEmptyOrg, status, track]);

  if (isEmptyOrg) {
    addWidgetReturningNull(WIDGET_IDS.ORGANISATION);
    return null;
  }

  return (
    <WidgetShell
      testId={WIDGET_IDS.ORGANISATION}
      category={{
        label: t('widget-organization.category-label'),
        link: `organization/org-chart?employeeId=${employeeId}`,
        icon: icons.orgChart,
      }}
      loadingSkeleton={<LoadingSkeleton />}
      isUnavailableForSupportAgent={true}
      requestStatus={status}
    >
      {data && <MyOrg data={data} />}
    </WidgetShell>
  );
};
