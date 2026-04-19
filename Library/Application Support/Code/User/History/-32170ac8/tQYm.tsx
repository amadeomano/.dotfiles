import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@personio-web/auth-context';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { suffixMetadata } from '@personio-web/design-system-utils';
import { useGetPersonDetails } from '@personio-web/design-system-data-person-details';
import type { SmartHoverCardReportProps } from '@personio-web/design-system-feature-smart-hover-card-types';
import { useEmployeeHoverCard } from '@personio-web/design-system-gofer';
import { useGetPersonDirectLinkIntegrations } from '@personio-web/design-system-hook-get-person-direct-link-integrations';
import { HoverCard as HoverCardComponent } from '@personio-web/design-system-component-hover-card';

import { mapReport } from './utils/mapReport';

export const SmartHoverCardReport = ({
  id,
  href,
  metadata,
  children,
  displayLegalName,
  openDelay,
  ...props
}: SmartHoverCardReportProps) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });
  const [isHoveredOrFocused, setIsHoveredOrFocused] = React.useState(false);
  const { isOn: isTwoColumnLayoutEnabled } = useFeatureFlag(
    'FIND-3498-dashboard-two-column-layout',
  );

  const authContext = useAuthContext();
  const {
    data: personData,
    isLoading: isPersonLoading,
    error: personError,
  } = useEmployeeHoverCard({
    variables: {
      personId: id,
      directReportsAmount: 3,
      companyId: authContext.companyId,
    },
    queryOptions: {
      enabled: isHoveredOrFocused,
    },
  });

  const { data: reportsData, isLoading: isPersonDetailsLoading } =
    useGetPersonDetails({
      requestPathParams: { personId: id },
    });

  const {
    data: { slackLink, msTeamsLink },
    isLoading: isIntegrationsLoading,
  } = useGetPersonDirectLinkIntegrations({
    personId: id,
    enabled: isHoveredOrFocused,
  });

  const report = useMemo(() => {
    const orgChartLink = isTwoColumnLayoutEnabled
      ? {
          href: generateOrgChartLink({
            source: 'Supervisor',
            activeCardId: id,
          }),
          label: t('org-chart-link'),
        }
      : undefined;
    return mapReport({
      displayLegalName,
      msTeamsLink,
      orgChartLink,
      personData: personData?.data,
      reportsData,
      slackLink,
    });
  }, [
    displayLegalName,
    id,
    isTwoColumnLayoutEnabled,
    msTeamsLink,
    personData?.data,
    reportsData,
    slackLink,
    t,
  ]);

  const isLoading =
    isPersonLoading || isIntegrationsLoading || isPersonDetailsLoading;

  return (
    <HoverCardComponent.Report
      href={href}
      isLoading={isLoading}
      isError={Boolean(personError)}
      report={report}
      metadata={suffixMetadata(metadata, 'smart-hover-card-report')}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onFocus={() => setIsHoveredOrFocused(true)}
      openDelay={openDelay}
      {...props}
    >
      {children}
    </HoverCardComponent.Report>
  );
};
