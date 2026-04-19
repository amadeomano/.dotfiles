import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@personio-web/auth-context';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { suffixMetadata } from '@personio-web/design-system-utils';

import { useGetPersonDirectLinkIntegrations } from 'designSystem/hook/get-person-direct-link-integrations';
import type { EntityHoverCardPersonProps } from '@personio-web/employees-organizations-feature-entity-hover-card-types';
import { useEmployeeHoverCard } from '@personio-web/employees-organizations-gofer';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';
import { useGetFeatureAccess } from 'designSystem/data/feature-access';
import { useGetPersonDetails } from 'designSystem/data/person-details';
import { HoverCard } from 'designSystem/component/hover-card';
import type { HoverCardPersonProps } from 'designSystem/component/hover-card';

import { getOutOfOfficeLabel } from './utils/getOutOfOfficeLabel';
import { mapPerson } from './utils/mapPerson';

export const EntityHoverCardPerson = ({
  id,
  href,
  metadata,
  children,
  displayLegalName,
  displayOutOfOffice,
  openDelay,
  ...props
}: EntityHoverCardPersonProps) => {
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
      enabled: isHoveredOrFocused && Number(id) > 0,
    },
  });

  const { data: orgchartAccess } = useGetFeatureAccess({
    requestPathParams: { area: 'org_chart' },
  });

  const {
    data: { slackLink, msTeamsLink },
    isLoading: isIntegrationsLoading,
  } = useGetPersonDirectLinkIntegrations({
    personId: id,
    enabled: isHoveredOrFocused && Number(id) > 0,
  });

  const { data: personDetails, isLoading: isPersonDetailsLoading } =
    useGetPersonDetails({
      requestPathParams: { personId: id },
      enabled: isHoveredOrFocused && Number(id) > 0,
    });

  const person = useMemo(() => {
    const orgChartLink =
      isTwoColumnLayoutEnabled && orgchartAccess?.data?.org_chart
        ? {
            href: generateOrgChartLink({
              source: 'Supervisor',
              activeCardId: id,
            }),
            label: t('org-chart-link'),
          }
        : undefined;

    const mappedPerson = mapPerson({
      personData: personData?.data,
      slackLink,
      msTeamsLink,
      displayLegalName,
      orgChartLink,
    });

    if (displayOutOfOffice) {
      const label = getOutOfOfficeLabel(personDetails);
      return label
        ? ({
            ...mappedPerson,
            outOfOfficeDescription: t(label.key, { ...label.options }),
          } as HoverCardPersonProps['person'])
        : mappedPerson;
    }

    return mappedPerson;
  }, [
    displayLegalName,
    id,
    isTwoColumnLayoutEnabled,
    orgchartAccess?.data,
    msTeamsLink,
    personData?.data,
    slackLink,
    t,
    displayOutOfOffice,
    personDetails,
  ]);

  const isLoading =
    isPersonLoading ||
    isIntegrationsLoading ||
    (displayOutOfOffice && isPersonDetailsLoading);

  return (
    <HoverCard.Person
      href={href}
      isLoading={isLoading}
      isError={Boolean(personError)}
      person={person}
      metadata={suffixMetadata(metadata, 'entity-hover-card-person')}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onFocus={() => setIsHoveredOrFocused(true)}
      openDelay={openDelay}
      {...props}
    >
      {children}
    </HoverCard.Person>
  );
};
