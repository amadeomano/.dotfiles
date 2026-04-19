import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { useAuthContext } from '@personio-web/auth-context';
import { useListEmploymentsByPersonIdsQuery } from '@personio-web/employees-organizations-data-gofer';
import { Inline, Stack } from 'designSystem/component/layout';
import { Picker, type PickerOptions } from 'designSystem/component/picker';

import {
  mapEmployeeOption,
  useGetSearchResults,
  useOrgChartPreferencesContext,
  useGetAdditionalSupervisorAttributes,
} from '../../../hooks';
import { HierarchicalRelationshipType, NodeType } from '../../../types';
import { TestIds } from '../../../utils';
import { updateEmploymentsQuery } from '../../../utils/updateEmploymentsQuery';
import { type ControlBarProps } from '../../types';

import styles from './ControlBarSpotlight.module.scss';

export type ControlBaSpotlightProps = Pick<ControlBarProps, 'hierarchy'>;

const PAGE_SIZE = 5;
const paginationConfigDefault = {
  enabled: true,
  pageSize: PAGE_SIZE, // show 5 rows in infinite loader
  hasMoreToLoad: false,
  onLoadMore: () => null, // for Search we don't need to load more
};

export const ControlBarSpotlight = ({ hierarchy }: ControlBaSpotlightProps) => {
  const prefs = useOrgChartPreferencesContext();
  const shouldSpotlightAutomatically = useRef(
    !prefs.spotlight && prefs.focusedEmployeeId,
  );

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (!prefs.spotlight && prefs.focusedEmployeeId) {
      prefs.setSpotlight(prefs.focusedEmployeeId, 'control-bar-menu');

      // Dismiss the spotlight menu if the spotlight is set to the focused employee
      timer = setTimeout(() => {
        const targetElement = document.elementFromPoint(0, 0);
        if (targetElement && targetElement instanceof HTMLElement) {
          targetElement.dispatchEvent(
            new KeyboardEvent('keydown', {
              key: 'Escape',
              code: 'Escape',
              bubbles: true,
              cancelable: true,
            }),
          );
        }
      }, 0);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shouldSpotlightAutomatically.current) {
    return null;
  }

  return <ControlBarSpotlightMenu hierarchy={hierarchy} />;
};

const ControlBarSpotlightMenu = ({ hierarchy }: ControlBaSpotlightProps) => {
  const prefs = useOrgChartPreferencesContext();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar.spotlight',
  });

  const { additionalSupervisorAttributes } =
    useGetAdditionalSupervisorAttributes();

  /*
   * List or search people and map into options
   */
  const [spotlightSearch, setSpotlightSearch] = useState<string>('');

  const { searchResults, isLoading: searchResultsLoading } =
    useGetSearchResults({
      searchTerm: spotlightSearch,
      isFiltering: false,
      getCompleteHierarchyNode: hierarchy.getNode,
    });

  const { companyId } = useAuthContext();

  const personIds = useMemo(() => {
    if (!hierarchy?.nodes) return [];

    const nodeIds = hierarchy.nodes
      .filter((node) => node.data.type === NodeType.Person)
      .map((node) => node.id);
    if (!prefs.spotlight) return nodeIds;

    return [prefs.spotlight, ...nodeIds.filter((id) => id !== prefs.spotlight)];
  }, [hierarchy?.nodes, prefs.spotlight]);

  const {
    data: employmentsData,
    loading: employmentsDataLoading,
    fetchMore: employmentsFetchMore,
  } = useListEmploymentsByPersonIdsQuery({
    skip: !personIds?.length,
    variables: {
      companyId,
      personIds: personIds.slice(0, PAGE_SIZE),
    },
  });

  const loadedItemsLength = employmentsData?.employments?.items?.length ?? 0;

  const onLoadMorePeople = useCallback(async () => {
    return employmentsFetchMore({
      updateQuery: updateEmploymentsQuery,
      variables: {
        companyId,
        personIds: personIds.slice(
          loadedItemsLength,
          loadedItemsLength + PAGE_SIZE,
        ),
      },
    });
  }, [companyId, employmentsFetchMore, loadedItemsLength, personIds]);

  const employmentsDataMapped = useMemo(() => {
    if (employmentsDataLoading || !employmentsData?.employments?.items)
      return [];

    return employmentsData?.employments?.items.map((item) =>
      mapEmployeeOption({
        id: Number(item?.person?.id || 0),
        name: item?.person?.preferredName?.value || '',
        avatar: item?.person?.profilePicUrls?.paths?.large || '',
      }),
    );
  }, [employmentsData?.employments?.items, employmentsDataLoading]);

  const peopleOptions = useMemo(() => {
    if (!searchResultsLoading && searchResults?.length) {
      return searchResults;
    }

    if (!employmentsDataLoading && employmentsDataMapped) {
      return employmentsDataMapped;
    }

    return [];
  }, [
    employmentsDataMapped,
    employmentsDataLoading,
    searchResults,
    searchResultsLoading,
  ]);

  const paginationConfig = useMemo(() => {
    return spotlightSearch
      ? {
          ...paginationConfigDefault,
          isLoading: searchResultsLoading,
        }
      : {
          ...paginationConfigDefault,
          isLoading: employmentsDataLoading,
          hasMoreToLoad: loadedItemsLength < personIds.length,
          onLoadMore: onLoadMorePeople,
        };
  }, [
    spotlightSearch,
    searchResultsLoading,
    employmentsDataLoading,
    loadedItemsLength,
    personIds.length,
    onLoadMorePeople,
  ]);

  /*
   * Map relationship types into options
   */

  // Enabling the expansion of the options after the first render allows the options to be contracted by default
  const [isExpansionEnabled, setIsExpansionEnabled] = useState(false);

  useEffect(() => {
    setIsExpansionEnabled(true);
  }, []);

  const relationshipOptions = useMemo(() => {
    if (
      additionalSupervisorAttributes &&
      Object.keys(additionalSupervisorAttributes).length
    ) {
      return [
        {
          value: HierarchicalRelationshipType.AllSupervisors,
          label: t('customize.all-supervisors'),
          disabled: !prefs.spotlight,
          subOptions: [
            {
              value: HierarchicalRelationshipType.Supervisor,
              label: t('customize.supervisor'),
              disabled: !prefs.spotlight,
            },
            ...Object.entries(additionalSupervisorAttributes).map(
              ([key, value]) => ({
                value: `${HierarchicalRelationshipType.Supervisor}:${key}`,
                label: value,
                disabled: !prefs.spotlight,
              }),
            ),
          ],
        },
        {
          value: HierarchicalRelationshipType.AllReports,
          label: t('customize.all-reports'),
          disabled: !prefs.spotlight,
          subOptions: [
            {
              value: HierarchicalRelationshipType.Report,
              label: t('customize.report'),
              disabled: !prefs.spotlight,
            },
            ...Object.entries(additionalSupervisorAttributes).map(
              ([key, value]) => ({
                value: `${HierarchicalRelationshipType.Report}:${key}`,
                label: value,
                disabled: !prefs.spotlight,
              }),
            ),
          ],
        },
      ];
    }

    return [
      {
        value: HierarchicalRelationshipType.Supervisor,
        label: t('customize.supervisor'),
        disabled: !prefs.spotlight,
      },
      {
        value: HierarchicalRelationshipType.Report,
        label: t('customize.report'),
        disabled: !prefs.spotlight,
      },
    ];
  }, [additionalSupervisorAttributes, prefs.spotlight, t]);

  const selectedRelationships = useMemo(() => {
    if (!prefs.spotlight) {
      return [];
    }

    if (prefs.spotlightVisibleRelationships.length) {
      return prefs.spotlightVisibleRelationships;
    }

    const optionValues: string[] = [
      HierarchicalRelationshipType.Supervisor,
      HierarchicalRelationshipType.Report,
    ];

    if (
      additionalSupervisorAttributes &&
      Object.keys(additionalSupervisorAttributes).length
    ) {
      optionValues.push(
        ...[
          HierarchicalRelationshipType.AllSupervisors,
          ...Object.keys(additionalSupervisorAttributes).map(
            (key) => `${HierarchicalRelationshipType.Supervisor}:${key}`,
          ),
          HierarchicalRelationshipType.AllReports,
          ...Object.keys(additionalSupervisorAttributes).map(
            (key) => `${HierarchicalRelationshipType.Report}:${key}`,
          ),
        ],
      );
    }

    return optionValues;
  }, [
    additionalSupervisorAttributes,
    prefs.spotlight,
    spotlightVisibleRelationships,
  ]);

  /*
   * Callbacks
   */
  const handleClean = useCallback(() => {
    setSpotlight('');
    setSpotlightSearch('');
  }, [setSpotlight]);

  /*
   * The problem:
   *  In "selectedRelationships memo" we use "spotlightVisibleRelationships" to pre-select the checkboxes,
   *  so, when it is the first load of the component we return a pre-select list with all options checked.
   *  when "selectedRelationships memo" is triggered by the select change and all the checkboxes are unchecked,
   *  it also returns a pre-select list and not allowing us to have all options unchecked.
   
   * The Solution:
   *  when unchecking them all, values array is [], so, We add a [-1] to the "spotlightVisibleRelationships"
   *  which will contains 1 item and it won't return the pre-select list again.
   *  when we have any other item selected, we remove the [-1] from the array.
   */
  const handleSpotlightVisibleRelationshipsChange = useCallback(
    (values: string[]) => {
      setSpotlightVisibleRelationships(
        values.length === 0 ? ['-1'] : values.filter((value) => value !== '-1'),
      );
    },
    [setSpotlightVisibleRelationships],
  );

  return (
    <Stack space="gap-large" className={styles.container}>
      <Stack>
        <Stack className={styles.sectionTitle}>
          <span>{t('title')}</span>
          <span className={styles.subTitle}>{t('sub-title')}</span>
        </Stack>
        <Inline className={styles.row}>
          <Picker.Root metadata={{ testId: TestIds.SpotlightPeoplePicker }}>
            <Picker.SearchTrigger
              placeholder={t('search-placeholder')}
              onRemoveOption={handleClean}
              onClear={handleClean}
              onSearchChange={setSpotlightSearch}
            />
            <Picker.Content
              options={peopleOptions as PickerOptions}
              multiple={false}
              selected={spotlight}
              onChange={setSpotlight}
              paginationConfig={paginationConfig}
            />
          </Picker.Root>
        </Inline>
      </Stack>

      <Stack>
        <Stack className={styles.sectionTitle}>
          <span>{t('customize.title')}</span>
          <span className={styles.subTitle}>{t('customize.subtitle')}</span>
        </Stack>
        <Inline className={styles.relationships}>
          <Picker.Content
            multiple={true}
            options={relationshipOptions}
            selected={selectedRelationships}
            onChange={handleSpotlightVisibleRelationshipsChange}
            metadata={{ testId: TestIds.SpotlightRelationshipsPicker }}
            hideSelectAll={true}
            searchConfig={{ enabled: false }}
            expandConfig={{
              enabled: Boolean(
                isExpansionEnabled &&
                  additionalSupervisorAttributes &&
                  Object.keys(additionalSupervisorAttributes).length,
              ),
            }}
          />
        </Inline>
      </Stack>
    </Stack>
  );
};
