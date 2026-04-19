import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@personio-web/auth-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { suffixMetadata } from '@personio-web/design-system-utils';
import { useEmployeeHoverCard } from '@personio-web/employees-organizations-gofer';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import type { EntityHoverCardReportProps } from '@personio-web/employees-organizations-feature-entity-hover-card-types';
import { useGetPersonDirectLinkIntegrations } from 'designSystem/hook/get-person-direct-link-integrations';
import { useGetPersonDetails } from 'designSystem/data/person-details';
import { HoverCard } from 'designSystem/component/hover-card';

import { mapReport } from './utils/mapReport';

export const EntityHoverCardReport = ({
  id,
  href,
  metadata,
  children,
  displayLegalName,
  openDelay,
  ...props
}: EntityHoverCardReportProps) => {
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
    <HoverCard.Report
      href={href}
      isLoading={isLoading}
      isError={Boolean(personError)}
      report={report}
      metadata={suffixMetadata(metadata, 'entity-hover-card-report')}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onFocus={() => setIsHoveredOrFocused(true)}
      openDelay={openDelay}
      {...props}
    >
      {children}
    </HoverCard.Report>
  );
};
