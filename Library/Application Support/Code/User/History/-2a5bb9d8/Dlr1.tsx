/* eslint-disable @personio-web/check-type-import */
import React from 'react';
import { Inline, Stack } from 'designSystem/component/layout';
import {
  Icon,
  icons,
  type IconSVGComponent,
} from 'designSystem/component/icon';
import styles from '../../EmployeeHeader.module.scss';
import { Token } from 'designSystem/component/token';
import type { EmployeeHeaderProps } from '@personio-web/employees-organizations-feature-employee-header-types';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import {
  URL_CONFIG_ORG_DEPARTMENT,
  URL_CONFIG_ORG_TEAM,
} from '../../constants';

type Entity = { name: string; id: string };

const SmartHoverCard = {
  Department: React.lazy(() =>
    import('designSystem/feature/smart-hover-card').then((module) => ({
      default: module.SmartHoverCard.Department,
    })),
  ),
  Team: React.lazy(() =>
    import('designSystem/feature/smart-hover-card').then((module) => ({
      default: module.SmartHoverCard.Team,
    })),
  ),
};

const EntityWrapper: React.FC<
  React.PropsWithChildren<{
    icon: IconSVGComponent;
  }>
> = ({ children, icon }) => (
  <Inline space="gap-small" alignVertical="center">
    <Icon icon={icon} />
    {children}
  </Inline>
);

const EntityLayout: React.FC<
  React.PropsWithChildren<{
    variant: NonNullable<EmployeeHeaderProps['variant']>;
  }>
> = ({ variant, children }) => {
  if (variant === 'compact') {
    return (
      <Stack space="gap-small" className={styles.employementEntities}>
        {children}
      </Stack>
    );
  }
  return (
    <Inline
      space="gap-large"
      alignVertical="center"
      className={styles.employementEntities}
    >
      {children}
    </Inline>
  );
};

export const EmploymentEntities: React.FC<{
  position?: string | null;
  department?: Entity;
  office?: Entity;
  team?: Entity;
  legalEntity?: string | null;
  variant: NonNullable<EmployeeHeaderProps['variant']>;
}> = ({ position, department, office, team, variant, legalEntity }) => {
  return (
    <EntityLayout variant={variant}>
      {/* TODO: No hover card for position (job) entity yet */}
      {position && (
        <EntityWrapper icon={icons.briefcase}>
          <Token label={position} />
        </EntityWrapper>
      )}
      {department?.id && (
        <EntityWrapper icon={icons.personCircle}>
          <React.Suspense fallback={null}>
            <SmartHoverCard.Department
              id={department.id}
              metadata={{ testId: 'employee-header-department' }}
              href={`${URL_CONFIG_ORG_DEPARTMENT}${department.id}`}
            >
              <Token
                label={department.name}
                href={generateOrgChartLink({
                  filters: [
                    {
                      id: 'department_id',
                      value: {
                        value: [department.id],
                        condition: 'contains',
                      },
                    },
                  ],
                })}
              />
            </SmartHoverCard.Department>
          </React.Suspense>
        </EntityWrapper>
      )}
      {office?.id && (
        <EntityWrapper icon={icons.pin}>
          <Token
            label={office.name}
            metadata={{ testId: 'employee-header-office' }}
          />
        </EntityWrapper>
      )}
      {team?.id && (
        <EntityWrapper icon={icons.circles2Overlapping}>
          <React.Suspense fallback={null}>
            <SmartHoverCard.Team
              id={team.id}
              metadata={{ testId: 'employee-header-team' }}
              href={`${URL_CONFIG_ORG_TEAM}${team.id}`}
            >
              <Token
                label={team.name}
                href={generateOrgChartLink({
                  filters: [
                    {
                      id: 'team_id',
                      value: {
                        value: [team.id],
                        condition: 'contains',
                      },
                    },
                  ],
                })}
              />
            </SmartHoverCard.Team>
          </React.Suspense>
        </EntityWrapper>
      )}
      {legalEntity && (
        <EntityWrapper icon={icons.buildingOffice}>
          <Token label={legalEntity} />
        </EntityWrapper>
      )}
    </EntityLayout>
  );
};
