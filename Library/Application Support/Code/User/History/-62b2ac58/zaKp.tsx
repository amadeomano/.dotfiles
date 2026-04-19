import React from 'react';

import {
  type EmployeeHoverCardQueryResult,
  type GetPersonSlackDataQueryResult,
} from '@personio-web/design-system-gofer';
import { type HoverCardPersonProps } from '@personio-web/design-system-component-hover-card';
import { icons } from '@personio-web/design-system-component-icon';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import { SmartHoverCardDepartment } from '../SmartHoverCardDepartment';
import { SmartHoverCardPerson } from '../SmartHoverCardPerson';
import { SmartHoverCardTeam } from '../SmartHoverCardTeam';
import { getPersonName } from './getPersonName';

export function mapPerson({
  personData,
  slackData,
  displayLegalName,
}: {
  personData?: EmployeeHoverCardQueryResult;
  slackData?: GetPersonSlackDataQueryResult;
  displayLegalName?: boolean;
}): HoverCardPersonProps['person'] {
  const employmentData =
    personData?.personandemployment_EmploymentService_GetEmployment_v1
      ?.employment;

  const directReportsCount =
    personData?.personandemployment_EmploymentService_ListEmployments_v1
      ?.pagination?.totalItems?.value;

  const contacts: NonNullable<HoverCardPersonProps['person']>['contacts'] = [];
  const slackUser = slackData?.slack?.user;

  if (slackUser?.id || slackUser?.teamId) {
    contacts.push({
      id: 'slack',
      icon: icons.speechBubble,
      label: 'Slack', // Intentionally not translated as it's a product name
      href: `slack://user?team=${slackUser.teamId}&id=${slackUser.id}`,
    });
  }

  if (employmentData?.person?.email?.value) {
    contacts.push({
      id: 'email',
      icon: icons.inbox,
      label: 'E-mail', // Intentionally not translated as it's an international term
      href: `mailto:${employmentData.person.email.value}`,
    });
  }

  return employmentData?.person?.preferredName?.value
    ? {
        name: getPersonName(employmentData.person),
        legalName: displayLegalName
          ? getPersonName(employmentData.person, true)
          : undefined,
        picture:
          employmentData?.person.profilePicUrls?.paths?.medium ?? undefined,
        position: employmentData?.positionTitle?.value ?? undefined,
        office: employmentData?.workplaceEntity?.name
          ? {
              name: employmentData.workplaceEntity.name,
            }
          : undefined,
        legalEntity: employmentData?.legalEntityDetails?.name
          ? {
              name: employmentData.legalEntityDetails?.name ?? '',
            }
          : undefined,
        department: employmentData?.departmentEntity?.name
          ? {
              id: employmentData.departmentEntity.id,
              name: employmentData.departmentEntity.name,
              renderHoverCard: ({ children }) => (
                <SmartHoverCardDepartment
                  id={employmentData.departmentEntity!.id}
                >
                  {children}
                </SmartHoverCardDepartment>
              ),
            }
          : undefined,
        team: employmentData?.teamEntity?.name
          ? {
              id: employmentData.teamEntity.id,
              name: employmentData.teamEntity.name,
              renderHoverCard: ({ children }) => (
                <SmartHoverCardTeam id={employmentData.teamEntity!.id}>
                  {children}
                </SmartHoverCardTeam>
              ),
            }
          : undefined,
        supervisor:
          employmentData?.supervisorEmployment?.person?.id &&
          employmentData?.supervisorEmployment?.person?.preferredName?.value
            ? {
                name: getPersonName(
                  employmentData.supervisorEmployment.person,
                  displayLegalName,
                ),
                picture:
                  employmentData.supervisorEmployment?.person?.profilePicUrls
                    ?.paths?.small ?? undefined,
                renderHoverCard: ({ children }) => (
                  <SmartHoverCardPerson
                    id={employmentData!.supervisorEmployment!.person!.id!}
                  >
                    {children}
                  </SmartHoverCardPerson>
                ),
              }
            : undefined,
        reports:
          directReportsCount && employmentData?.directReportEmployments?.length
            ? {
                total: directReportsCount,
                items: employmentData.directReportEmployments
                  ?.map((directReport) =>
                    directReport?.person?.id &&
                    directReport.person.preferredName?.value
                      ? {
                          id: directReport.person.id,
                          name: getPersonName(
                            directReport.person,
                            displayLegalName,
                          ),
                          src:
                            directReport.person.profilePicUrls?.paths?.small ??
                            undefined,
                        }
                      : undefined,
                  )
                  .filter(Boolean) as NonNullable<
                  NonNullable<HoverCardPersonProps['person']>['reports']
                >['items'],
              }
            : undefined,
        contacts: contacts.length ? contacts : undefined,
      }
    : undefined;
}
