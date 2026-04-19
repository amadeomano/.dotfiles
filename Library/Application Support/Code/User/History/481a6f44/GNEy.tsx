import React from 'react';
import { useTranslation } from 'react-i18next';
import * as RadixHoverCard from '@radix-ui/react-hover-card';

import {
  parseMetadata,
  suffixMetadata,
} from '@personio-web/design-system-utils';
import { createSlots } from '@personio-web/design-system-utils';
import { Avatar } from '@personio-web/design-system-component-avatar';
import { Breadcrumb } from '@personio-web/design-system-component-breadcrumb';
import { EmptyState } from '@personio-web/design-system-component-empty-state';
import type {
  HoverCardBaseProps,
  HoverCardCompanyProps,
  HoverCardComponent,
  HoverCardDepartmentProps,
  HoverCardOfficeProps,
  HoverCardOrgUnitProps,
  HoverCardPersonProps,
  HoverCardPositionProps,
  HoverCardReportProps,
  HoverCardTeamProps,
} from '@personio-web/design-system-component-hover-card-types';
import { Icon, icons } from '@personio-web/design-system-component-icon';
import { Inline, Stack } from '@personio-web/design-system-component-layout';
import { HybridLink } from '@personio-web/design-system-component-link';
import { MetadataItem } from '@personio-web/design-system-component-metadata-item';
import { generateOrgChartLink } from '@personio-web/eo-commons-org-chart-link';

import { PersonActions, PersonHeader } from './components';
import { Description } from './Description';
import { Divider } from './Divider';
import { Skeleton } from './Skeleton';

import styles from './HoverCard.module.scss';

const NestedHoverCardContext = React.createContext<boolean>(false);

const ErrorState = ({ metadata }: Pick<HoverCardBaseProps, 'metadata'>) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <div className={`${styles.hoverCard} ${styles.errorState}`}>
      <EmptyState
        icon={icons.exclamationMarkTriangle}
        title={t('errors.failed-to-fetch-data-title')}
        description={t('errors.failed-to-fetch-data-description')}
        metadata={suffixMetadata(metadata, 'error-state')}
      />
    </div>
  );
};

const delayCall = (fn: (() => void) | undefined, delay: number) => {
  return function () {
    setTimeout(() => {
      fn && fn();
    }, delay);
  };
};

const HoverCardPopover = ({
  href,
  trigger,
  children,
  isError,
  metadata,
  onMouseEnter,
  onFocus,
  openDelay = 500,
}: HoverCardBaseProps & { trigger: React.ReactNode }) => {
  const isNestedHoverCard = React.useContext(NestedHoverCardContext);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleClose = () => setOpen(false);
    window.addEventListener('wheel', handleClose, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleClose);
    };
  }, []);

  const finalOpenDelay = isNestedHoverCard ? 300 : openDelay;

  return (
    <RadixHoverCard.Root
      openDelay={openDelay}
      open={open}
      onOpenChange={setOpen}
    >
      <RadixHoverCard.Trigger
        asChild={true}
        onMouseEnter={delayCall(onMouseEnter, finalOpenDelay)}
        onFocus={delayCall(onFocus, finalOpenDelay)}
        {...parseMetadata(suffixMetadata(metadata, 'trigger'))}
      >
        {href ? (
          <HybridLink href={href} unstyled={true}>
            {trigger}
          </HybridLink>
        ) : (
          trigger
        )}
      </RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          sideOffset={4}
          alignOffset={4}
          className={styles.popover}
          side={isNestedHoverCard ? 'right' : 'bottom'}
          {...parseMetadata(suffixMetadata(metadata, 'content'))}
        >
          <NestedHoverCardContext.Provider value={true}>
            {isError ? <ErrorState metadata={metadata} /> : children}
          </NestedHoverCardContext.Provider>
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
};

const HoverCardCompany = ({
  company,
  href,
  children,
  isLoading,
  metadata,
  ...props
}: HoverCardCompanyProps) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <HoverCardPopover
      trigger={children}
      href={href}
      metadata={metadata}
      {...props}
    >
      {isLoading ? (
        <Skeleton
          avatar="square"
          subtitle={true}
          description={true}
          items={2}
          metadata={metadata}
        />
      ) : (
        company && (
          <Stack className={styles.hoverCard} space="gap-large">
            <Inline
              className={styles.infoHero}
              space="gap-large"
              alignVertical="center"
            >
              {company.logo && (
                <div className={styles.avatar}>
                  <Avatar
                    src={company.logo}
                    name={company.name}
                    size="full"
                    format="square"
                  />
                </div>
              )}
              <Stack space="gap-xsmall" className={styles.info}>
                <h4 className={styles.title}>{company.name}</h4>
                <span className={styles.subtitle}>{t('company')}</span>
              </Stack>
            </Inline>
            {company.description && (
              <Description href={href}>{company.description}</Description>
            )}
            {(company.offices || company.people) && (
              <Stack className={styles.metadata}>
                {company.offices && (
                  <MetadataItem.Text
                    icon={icons.pin}
                    label={t('offices', { count: company.offices.total })}
                  />
                )}
                {company.people && (
                  <MetadataItem.FacePile
                    icon={icons.people2}
                    items={company.people.items}
                    label={t('people', { count: company.people.total })}
                  />
                )}
              </Stack>
            )}
          </Stack>
        )
      )}
    </HoverCardPopover>
  );
};

const HoverCardOffice = ({
  office,
  href,
  children,
  isLoading,
  metadata,
  ...props
}: HoverCardOfficeProps) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <HoverCardPopover
      trigger={children}
      href={href}
      metadata={metadata}
      {...props}
    >
      {isLoading ? (
        <Skeleton
          map={true}
          description={true}
          items={3}
          actions={1}
          metadata={metadata}
        />
      ) : (
        office && (
          <Stack className={styles.hoverCard} space="gap-large">
            {/* TODO: Implement map */}
            <div className={styles.mapHero} />
            <h4 className={styles.title}>{office.name}</h4>
            {(office.address || office.openingHours) && (
              <Inline space="gap-large" className={styles.location}>
                {office.address && (
                  <Stack>
                    {office.address.line1 && (
                      <span>{office.address.line1}</span>
                    )}
                    {office.address.line2 && (
                      <span>{office.address.line2}</span>
                    )}
                    {office.address.country && (
                      <span>{office.address.country}</span>
                    )}
                  </Stack>
                )}
                {office.openingHours && (
                  <Stack>
                    <span>{office.openingHours.period}</span>
                    {office.openingHours.isOpen !== undefined && (
                      <span
                        className={
                          office.openingHours.isOpen
                            ? styles.opened
                            : styles.closed
                        }
                      >
                        {t(
                          office.openingHours.isOpen
                            ? 'opening-hours.open-now'
                            : 'opening-hours.closed',
                        )}
                      </span>
                    )}
                  </Stack>
                )}
              </Inline>
            )}
            {(office.departments || office.teams || office.people) && (
              <Stack className={styles.metadata}>
                {office.departments && (
                  <MetadataItem.Text
                    icon={icons.personCircle}
                    label={t('departments', {
                      count: office.departments.total,
                    })}
                  />
                )}
                {office.teams && (
                  <MetadataItem.Text
                    icon={icons.circles2Overlapping}
                    label={t('teams', { count: office.teams.total })}
                  />
                )}
                {office.people && (
                  <MetadataItem.FacePile
                    icon={icons.people2}
                    items={office.people.items}
                    label={t('people', { count: office.people.total })}
                  />
                )}
              </Stack>
            )}
            {office.phoneNumber && (
              <div className={styles.actions}>
                <a
                  href={`tel:${office.phoneNumber}`}
                  className={styles.action}
                  // prefent click propogation on the table row
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon icon={icons.phone} size="large" />
                  {t('actions.call')}
                  <span className={styles.phoneNumber}>
                    ({office.phoneNumber})
                  </span>
                </a>
              </div>
            )}
          </Stack>
        )
      )}
    </HoverCardPopover>
  );
};

const HoverCardOrgUnit = ({
  entity,
  orgUnit,
  href,
  children,
  metadata,
  isLoading,
  ...props
}: HoverCardBaseProps & {
  entity: 'team' | 'department';
  orgUnit?: HoverCardOrgUnitProps;
}) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <HoverCardPopover
      trigger={children}
      href={href}
      metadata={metadata}
      {...props}
    >
      {isLoading ? (
        <Skeleton
          breadcrumb={true}
          description={true}
          items={3}
          metadata={metadata}
        />
      ) : (
        orgUnit && (
          <Stack className={styles.hoverCard} space="gap-large">
            <Stack space="gap-xsmall" className={styles.infoHero}>
              {orgUnit.ancestors && orgUnit.ancestors.length > 0 && (
                <div
                  className={styles.ancestors}
                  {...parseMetadata(suffixMetadata(metadata, 'ancestors'))}
                >
                  <Breadcrumb size="meta">
                    {[...orgUnit.ancestors].reverse().map((ancestor, i) => [
                      <React.Fragment key={`ancestor-${i}`}>
                        {i > 0 && <Breadcrumb.Separator />}
                        <Breadcrumb.Item>{ancestor}</Breadcrumb.Item>
                      </React.Fragment>,
                    ])}
                  </Breadcrumb>
                </div>
              )}
              <h4 className={styles.title}>{orgUnit.name}</h4>
            </Stack>
            {orgUnit.description && (
              <Description href={href}>{orgUnit.description}</Description>
            )}
            {(orgUnit.code || orgUnit.descendants || orgUnit.members) && (
              <Stack className={styles.metadata}>
                {orgUnit.code && (
                  <MetadataItem.Text
                    icon={icons.poundSign}
                    label={orgUnit.code}
                  />
                )}
                {orgUnit.descendants && (
                  <MetadataItem.Text
                    icon={icons.orgChart}
                    label={t(
                      entity === 'department' ? 'sub-departments' : 'sub-teams',
                      { count: orgUnit.descendants.total },
                    )}
                  />
                )}
                {orgUnit.members && (
                  <MetadataItem.FacePile
                    icon={icons.people2}
                    items={orgUnit.members.items}
                    label={t('members', { count: orgUnit.members.total })}
                  />
                )}
              </Stack>
            )}
          </Stack>
        )
      )}
    </HoverCardPopover>
  );
};

const HoverCardDepartment = ({
  department,
  ...props
}: HoverCardDepartmentProps) => (
  <HoverCardOrgUnit entity="department" orgUnit={department} {...props} />
);

const HoverCardTeam = ({ team, ...props }: HoverCardTeamProps) => (
  <HoverCardOrgUnit entity="team" orgUnit={team} {...props} />
);

const HoverCardPosition = ({
  position,
  href,
  children,
  isLoading,
  metadata,
  ...props
}: HoverCardPositionProps) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <HoverCardPopover
      trigger={children}
      href={href}
      metadata={metadata}
      {...props}
    >
      {isLoading ? (
        <Skeleton
          subtitle={true}
          description={true}
          items={1}
          metadata={metadata}
        />
      ) : (
        position && (
          <Stack className={styles.hoverCard} space="gap-large">
            <Stack space="gap-xsmall" className={styles.infoHero}>
              <h4 className={styles.title}>{position.name}</h4>
              <span className={styles.subtitle}>{t('position')}</span>
            </Stack>
            {position.description && (
              <Description href={href}>{position.description}</Description>
            )}
            {position.people && (
              <Stack className={styles.metadata}>
                <MetadataItem.FacePile
                  icon={icons.people2}
                  items={position.people.items}
                  label={t('people', { count: position.people.total })}
                />
              </Stack>
            )}
          </Stack>
        )
      )}
    </HoverCardPopover>
  );
};

const HoverCardPersonCustom = ({
  href,
  trigger,
  children,
  isLoading,
  metadata,
  ...props
}: HoverCardBaseProps & { trigger: React.ReactNode }) => {
  const { slots, rest: unmatchedComponents } = createSlots(children, {
    header: PersonHeader,
    items: [
      MetadataItem['Token'],
      MetadataItem['FacePile'],
      MetadataItem['Text'],
      MetadataItem['Value'],
      Divider,
    ],
    description: Description,
    actions: PersonActions,
  });
  if (unmatchedComponents.length > 0) {
    throw new Error('HoverCardCustom only supports children of type ...');
  }
  return (
    <HoverCardPopover
      trigger={trigger}
      href={href}
      metadata={metadata}
      {...props}
    >
      {isLoading ? (
        <Skeleton
          avatar="round"
          subtitle={true}
          description={true}
          items={5}
          actions={2}
          metadata={metadata}
        />
      ) : (
        <Stack className={styles.hoverCard} space="gap-large">
          {slots.header}
          {slots.description}
          <Stack className={styles.metadata}>{slots.items}</Stack>
          {slots.actions}
        </Stack>
      )}
    </HoverCardPopover>
  );
};

const HoverCardPerson = ({
  person,
  href,
  children,
  isLoading,
  metadata,
  ...props
}: HoverCardPersonProps) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <HoverCardPersonCustom
      href={href}
      trigger={children}
      isLoading={isLoading}
      metadata={metadata}
      {...props}
    >
      {person && (
        <PersonHeader
          picture={person.picture}
          name={person.name}
          legalName={person.legalName}
          position={person.position}
        />
      )}
      {person?.description && (
        <Description href={href}>{person.description}</Description>
      )}

      {person?.office && (
        <MetadataItem.Token
          icon={icons.pin}
          renderHoverCard={person.office.renderHoverCard}
          items={[
            {
              id: 'office',
              label: person.office.name,
            },
          ]}
        />
      )}
      {person?.legalEntity && (
        <MetadataItem.Token
          icon={icons.buildingOffice}
          items={[
            {
              id: 'legalEntity',
              label: person.legalEntity.name,
            },
          ]}
        />
      )}
      {person?.department && (
        <MetadataItem.Token
          icon={icons.personCircle}
          renderHoverCard={person.department.renderHoverCard}
          items={[
            {
              id: 'department',
              label: person.department.name,
              href: person.department.id
                ? generateOrgChartLink({
                    filters: [
                      {
                        id: 'department_id',
                        value: {
                          value: [person.department.id.toString()],
                          condition: 'contains',
                        },
                      },
                    ],
                  })
                : undefined,
            },
          ]}
        />
      )}
      {person?.team && (
        <MetadataItem.Token
          icon={icons.circles2Overlapping}
          renderHoverCard={person.team.renderHoverCard}
          items={[
            {
              id: 'team',
              label: person.team.name,
              href: generateOrgChartLink({
                filters: [
                  {
                    id: 'team_id',
                    value: {
                      value: [person.team.id.toString()],
                      condition: 'contains',
                    },
                  },
                ],
              }),
            },
          ]}
        />
      )}
      {person?.supervisor && (
        <MetadataItem.Token
          icon={icons.personArrowUp}
          renderHoverCard={person.supervisor.renderHoverCard}
          prefix={t('reports-to-supervisor')}
          items={[
            {
              id: 'supervisor',
              label: person.supervisor.name,
              avatar: {
                src: person.supervisor.picture,
                name: person.supervisor.name,
              },
            },
          ]}
        />
      )}
      {person?.reports && (
        <MetadataItem.FacePile
          icon={icons.orgChart}
          items={person.reports.items}
          label={t('reports', { count: person.reports.total })}
        />
      )}
      {person?.contacts && <PersonActions contacts={person.contacts} />}
    </HoverCardPersonCustom>
  );
};

const HoverCardReport = ({
  href,
  report,
  children,
  isLoading,
  metadata,
  ...props
}: HoverCardReportProps) => {
  const { t } = useTranslation('design-system', { keyPrefix: 'hover-card' });

  return (
    <HoverCardPersonCustom
      href={href}
      trigger={children}
      isLoading={isLoading}
      metadata={metadata}
      {...props}
    >
      {report && (
        <PersonHeader
          picture={report.picture}
          name={report.name}
          legalName={report.legalName}
          position={report.position}
        />
      )}
      {report?.birthday && (
        <MetadataItem.Value
          icon={icons.birthdayCake}
          label={t('birthday')}
          value={report?.birthday}
        />
      )}
      {report?.anniversary && (
        <MetadataItem.Value
          icon={icons.star}
          label={t('anniversary')}
          value={report?.anniversary}
        />
      )}

      {(report?.birthday || report?.anniversary) && <Divider />}

      {report?.time_off && (
        <MetadataItem.Value
          icon={icons.palmTree}
          label={t('paid-time-off')}
          value={report?.time_off}
        />
      )}
      {report?.sick_days && (
        <MetadataItem.Value
          icon={icons.faceSmile}
          label={t('sick-days')}
          value={report?.sick_days}
        />
      )}
      {report?.scheduled_time_off && (
        <MetadataItem.Value
          icon={icons.calendar}
          label={t('next-time-off')}
          value={report?.scheduled_time_off}
        />
      )}

      {(report?.time_off ||
        report?.sick_days ||
        report?.scheduled_time_off) && <Divider />}

      {report?.weekly_hours && (
        <MetadataItem.Value
          icon={icons.clockArrowCirclepath}
          label={t('week-hours-worked')}
          value={report?.weekly_hours}
        />
      )}
      {report?.current_period_extra_hours && (
        <MetadataItem.Value
          icon={icons.dateNextQuarter}
          label={t('overtime')}
          value={report?.current_period_extra_hours}
        />
      )}

      {report?.contacts && <PersonActions contacts={report.contacts} />}
    </HoverCardPersonCustom>
  );
};

export const HoverCard: HoverCardComponent = {
  Company: HoverCardCompany,
  Office: HoverCardOffice,
  Department: HoverCardDepartment,
  Team: HoverCardTeam,
  Position: HoverCardPosition,
  Person: HoverCardPerson,
  Report: HoverCardReport,
};
