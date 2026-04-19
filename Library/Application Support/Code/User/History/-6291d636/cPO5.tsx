import React, { Fragment, useMemo } from 'react';

import classNames from 'classnames';

import { Breadcrumb } from 'designSystem/component/breadcrumb';
import { Button } from 'designSystem/component/button';
import { Enum } from 'designSystem/component/enum';
import { icons } from 'designSystem/component/icon';
import { Inline, Stack } from 'designSystem/component/layout';
import { HybridLink } from 'designSystem/component/link';
import { MetadataItem } from 'designSystem/component/metadata-item';
import { OverflowTooltip } from 'designSystem/component/overflow-tooltip';
import { Token } from 'designSystem/component/token';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';

import { useOrgUnitWidget } from '@personio-web/employees-organizations-gofer';
import { buildPeopleListLink } from '@personio-web/employees-organizations-hook-generate-people-list-link';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import { mapEntityData } from './utils/mapEntityData';
import { useTranslations } from '../../hooks/useTranslations';
import { type AboutMeCardProps, AboutMeCard } from '../AboutMeCard/AboutMeCard';
import { useAboutMeContext } from '../AboutMeProvider/AboutMeProvider';
import { OrgChartWidgetButton } from '../OrgChartWidgetButton/OrgChartWidgetButton';

import styles from './OrgUnitsWidget.module.scss';

type OrgUnitsWidgetProps = Omit<AboutMeCardProps, 'children'> & {
  orgEntity: 'department' | 'team';
  orgUnitId: string;
};

const OrgUnitsWidget: React.FC<OrgUnitsWidgetProps> = ({
  orgEntity,
  orgUnitId,
  ...cardProps
}) => {
  const { data, isLoading } = useOrgUnitWidget({
    variables: {
      orgUnitId,
      type: orgEntity,
      descendantsFilter: `parent_id == ${orgUnitId}`,
    },
  });

  const entityData = useMemo(() => mapEntityData(data?.data), [data]);

  const { t } = useTranslations();

  const ancestors = useMemo(
    () =>
      entityData?.ancestors && entityData?.ancestors.length > 0 ? (
        <Breadcrumb size="meta">
          {entityData?.ancestors.map((ancestor, i) => [
            <Fragment key={`ancestor-${i}`}>
              <Breadcrumb.Item>{ancestor}</Breadcrumb.Item>
              <Breadcrumb.Separator />
            </Fragment>,
          ])}
        </Breadcrumb>
      ) : undefined,
    [entityData?.ancestors],
  );

  const shouldRenderDescriptionOnSecondColumn =
    !entityData?.descendants?.list.length;

  const hasSecondRow =
    !shouldRenderDescriptionOnSecondColumn || Boolean(entityData?.description);

  const membersLink = useMemo(() => {
    const attributeId =
      orgEntity === 'department' ? 'department_id' : 'team_id';

    return buildPeopleListLink({
      columns: [attributeId],
      filters: { [attributeId]: [orgUnitId] },
    });
  }, [orgEntity, orgUnitId]);

  const orgChartLink = useMemo(() => {
    const attributeId =
      orgEntity === 'department' ? 'department_id' : 'team_id';

    return generateOrgChartLink({
      filters: [
        {
          id: attributeId,
          value: {
            value: [orgUnitId],
            condition: 'contains',
          },
        },
      ],
    });
  }, [orgEntity, orgUnitId]);

  const HoverCardComponent =
    orgEntity === 'team' ? SmartHoverCard.Team : SmartHoverCard.Department;

  return (
    <AboutMeCard
      {...cardProps}
      requestStatus={isLoading ? 'loading' : 'success'}
      button={
        entityData?.membersCount ? (
          <HybridLink href={membersLink} unstyled target="_blank">
            <Button>
              {t('widget.org-units.common.members', {
                count: entityData.membersCount,
              })}
            </Button>
          </HybridLink>
        ) : undefined
      }
      iconButton={<OrgChartWidgetButton orgChartLink={orgChartLink} />}
    >
      <div
        className={classNames({
          [styles.container]: true,
          [styles.conatinerWithColumns]: hasSecondRow,
        })}
      >
        <Stack space="gap-large">
          <Stack space="gap-small">
            {ancestors}
            <Inline space="gap-default" alignVertical="center">
              <OverflowTooltip className={styles.entityName}>
                <span>{entityData?.name}</span>
              </OverflowTooltip>
              {entityData?.code && <Enum label={entityData.code} />}
            </Inline>
          </Stack>
          {!shouldRenderDescriptionOnSecondColumn &&
            entityData?.description && (
              <span className={styles.entityDescription}>
                {entityData?.description}
              </span>
            )}
        </Stack>

        {shouldRenderDescriptionOnSecondColumn && entityData?.description && (
          <Stack>
            <span className={styles.entityDescription}>
              {entityData?.description}
            </span>
          </Stack>
        )}

        {entityData?.descendants?.list &&
        entityData?.descendants?.list.length > 0 ? (
          <Stack space="gap-default">
            <MetadataItem.Text
              icon={icons.orgChart}
              label={t(
                orgEntity === 'department'
                  ? 'widget.org-units.department.sub-departments'
                  : 'widget.org-units.team.sub-teams',
                { count: entityData?.descendants?.list.length },
              )}
            />
            <Inline space="gap-default">
              {entityData?.descendants?.list.map(({ name, id }) => (
                <React.Suspense fallback={null}>
                  <HoverCardComponent key={id} id={String(id)}>
                    <Token label={name} />
                  </HoverCardComponent>
                </React.Suspense>
              ))}
            </Inline>
          </Stack>
        ) : null}
      </div>
    </AboutMeCard>
  );
};

export const DepartmentWidget: React.FC = () => {
  const { t } = useTranslations();

  const { metadata } = useAboutMeContext();
  const departmentId = metadata?.departmentId;

  if (!departmentId) {
    return null;
  }

  return (
    <OrgUnitsWidget
      orgEntity="department"
      orgUnitId={departmentId}
      title={t('widget.org-units.department.title')}
    />
  );
};

export const TeamWidget: React.FC = () => {
  const { t } = useTranslations();

  const { metadata } = useAboutMeContext();
  const teamId = metadata?.teamId;

  if (!teamId) {
    return null;
  }

  return (
    <OrgUnitsWidget
      orgEntity="team"
      title={t('widget.org-units.team.title')}
      orgUnitId={teamId}
    />
  );
};
