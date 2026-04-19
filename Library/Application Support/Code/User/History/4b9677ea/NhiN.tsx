import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  ListItem,
  ListItemAvatar,
  ListItemText,
} from 'designSystem/component/list';
import {
  ControlBar,
  Controls,
  type SortComponent,
} from 'designSystem/component/control-bar';
import { Stack } from 'designSystem/component/layout';
import { Picker } from 'designSystem/component/picker';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { type PresetType } from '@personio-web/employees-organizations-util-org-units';
import { useGeneratePersonLink } from '@personio-web/employees-organizations-hook-use-generate-person-link';

import { FeatureFlags } from '../featureFlags';
import { toTranslate } from '../toTranslate';
import { type OrgUnitResult } from '../../types';
import {
  type Member,
  type OrderBy,
  MEMBERS_LIST_PAGE_SIZE,
  useListMembers,
} from './useListMembers';
import { LegacyLink } from './PeopleListLink/LegacyLink';
import { DirectPeopleListLink } from './PeopleListLink/DirectPeopleListLink';
import styles from './styles.module.scss';

const SmartHoverCard = {
  Person: React.lazy(() =>
    import('designSystem/feature/smart-hover-card').then((module) => ({
      default: module.SmartHoverCard.Person,
    })),
  ),
};

type Props = { orgUnit: OrgUnitResult; type: PresetType };
export const MembersList = ({ orgUnit, type }: Props) => {
  const { t } = useTranslation('org-units');

  const [orderBy, setOrderBy] = useState<OrderBy | undefined>();
  const featureFlag = useFeatureFlag(FeatureFlags.SHOW_MEMBERS_LIST);
  const isEnabledAndReady = featureFlag.isOn && featureFlag.isReady;

  const options = useMemo<SortComponent['options']>(
    () => [
      {
        label: t('', { defaultValue: toTranslate.sortByOptions.name }),
        value: 'person.preferred_name',
      },
      {
        label: t('', { defaultValue: toTranslate.sortByOptions.title }),
        value: 'position_title',
      },
    ],
    [],
  );

  const membersListData = useListMembers({
    orgUnit,
    orderBy,
    enabled: isEnabledAndReady,
  });

  if (!isEnabledAndReady) return <LegacyLink orgUnit={orgUnit} type={type} />;

  const pages = membersListData.data?.pages ?? [];
  const members =
    pages?.flatMap((page) => page.data?.membersData?.employmentsList) ?? [];
  const nextPageToken =
    pages[pages.length - 1]?.data?.membersData?.nextPageToken;

  // Couldn't be memorized for now due to early return when FF is disabled
  const membersOptions = members.map((member) => ({
    value: member?.personId ?? '',
    label: <MemberOption member={member} />,
  }));

  if (members.length === 0) return null;

  return (
    <Stack className={styles.membersList}>
      <DirectPeopleListLink orgUnit={orgUnit} type={type} />
      <ControlBar>
        <Controls.Sort
          searchConfig={{ enabled: false }}
          resetSorting={() => setOrderBy(undefined)}
          onChange={(value) => setOrderBy(value?.value as OrderBy)}
          value={orderBy ? { id: orderBy, desc: false } : undefined}
          options={options}
        />
      </ControlBar>
      <Picker
        options={membersOptions}
        multiple={false}
        selected=""
        onChange={() => undefined}
        searchConfig={{ enabled: false }}
        virtualizationConfig={{ enabled: false }} // virtualisation doesn't support custom scrollable area
        paginationConfig={{
          enabled: true,
          pageSize: MEMBERS_LIST_PAGE_SIZE,
          hasMoreToLoad: Boolean(nextPageToken),
          isLoading: membersListData.isFetching,
          onLoadMore: () => {
            membersListData.fetchNextPage({ pageParam: nextPageToken });
          },
        }}
      />
    </Stack>
  );
};

const MemberOption = ({ member }: { member?: Member }) => {
  const generatePersonLink = useGeneratePersonLink();

  if (!member) return null;

  const personId = member.personId;
  const personName = member.person?.preferredName?.value ?? undefined;
  const profilePicUrl =
    member.person?.profilePicUrls?.paths?.medium ?? undefined;
  const positionTitle = member.positionTitle?.value ?? undefined;

  return (
    <React.Suspense fallback={null}>
      <SmartHoverCard.Person id={personId} href={generatePersonLink(personId)}>
        <ListItem className={styles.memberOption}>
          <ListItemAvatar
            size="default"
            src={profilePicUrl}
            name={personName}
          />
          <ListItemText meta={positionTitle}>{personName}</ListItemText>
        </ListItem>
      </SmartHoverCard.Person>
    </React.Suspense>
  );
};
