import React, { useMemo } from 'react';

import { useAuthContext } from '@personio-web/auth-context';

import { suffixMetadata } from '@personio-web/design-system-utils';
import type { SmartHoverCardPersonProps } from '@personio-web/design-system-feature-smart-hover-card-types';
import {
  useEmployeeHoverCard,
  useGetPersonSlackData,
  useListIntegrations,
} from '@personio-web/design-system-gofer';
import { HoverCard as HoverCardComponent } from '@personio-web/design-system-component-hover-card';

import { mapPerson } from './utils/mapPerson';

export const SmartHoverCardPerson = ({
  id,
  href,
  metadata,
  children,
  displayLegalName,
  openDelay,
}: SmartHoverCardPersonProps) => {
  const [isHoveredOrFocused, setIsHoveredOrFocused] = React.useState(false);

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

  /*
   * To construct the slack link, we need to check if the slack integration
   * is enabled for the company and then fetch the slack data for the person.
   */
  const { data: integrationsData, isLoading: isIntegrationsLoading } =
    useListIntegrations({
      queryOptions: {
        enabled: isHoveredOrFocused,
      },
    });

  const hasSlackIntegrationEnabled = useMemo(
    () =>
      !isIntegrationsLoading &&
      integrationsData?.data?.integrations?.find(
        (item) => item?.name === 'slack',
      )?.status === 'ENABLED',
    [integrationsData?.data?.integrations, isIntegrationsLoading],
  );

  const { data: slackData, isLoading: isSlackLoading } = useGetPersonSlackData({
    variables: {
      personId: Number(id),
    },
    queryOptions: {
      enabled: isHoveredOrFocused && hasSlackIntegrationEnabled,
    },
  });

  const person = useMemo(
    () =>
      mapPerson({
        personData: personData?.data,
        slackData: slackData?.data,
        displayLegalName,
      }),
    [displayLegalName, personData?.data, slackData?.data],
  );
  console.log('[] person', person, personData?.data);

  const isLoading = isPersonLoading || isIntegrationsLoading || isSlackLoading;

  return (
    <HoverCardComponent.Person
      href={href}
      isLoading={isLoading}
      isError={Boolean(personError)}
      person={person}
      metadata={suffixMetadata(metadata, 'smart-hover-card-person')}
      onMouseEnter={() => setIsHoveredOrFocused(true)}
      onFocus={() => setIsHoveredOrFocused(true)}
      openDelay={openDelay}
    >
      {children}
    </HoverCardComponent.Person>
  );
};
