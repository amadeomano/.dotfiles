import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';

import { useAmplitude } from '@personio-web/amplitude-provider';
import type { ColumnFilter } from '@personio-web/design-system-component-advanced-filter-types';
import { useGetEmployeeListColumns } from '@personio-web/employees-organizations-data-people-list';
import { useQueryParamState } from '@personio-web/employees-organizations-hook-use-query-param-state';
import type { PersonAttribute } from '@personio-web/employees-organizations-util-people';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import {
  FeatureFlags,
  initialAttributes,
  initialCardPreferences,
} from '../constants';
import * as Amp from '../constants/amplitude';
import {
  type CardsPreferences,
  type OrgChartPreferences,
  OrgChartQueryParamKeys,
  type View,
} from '../types';
import { conditionallyAddJobAttributes } from '../utils';

export const LOCAL_STORAGE_PREFIX = 'eo.orgChart';

export const useOrgChartPreferences = (): OrgChartPreferences => {
  const { track } = useAmplitude();

  const { isReady, isOn } = useFeatureFlag(FeatureFlags.ENABLE_SPOTLIGHT);
  const isSpotlightFFEnabled = isReady && isOn;

  const [searchTerm, setSearchTerm] = useState<string>('');

  const [filters, setFilters] = useQueryParamState<ColumnFilter[]>({
    key: OrgChartQueryParamKeys.FILTERS,
    defaultValue: [],
    localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.FILTERS}`,
    forceParseAsJson: true,
  });

  const [view, setView] = useState<View | null>(null);

  const [cardPreferences, setCardPreferences] =
    useQueryParamState<CardsPreferences>({
      key: OrgChartQueryParamKeys.CARD_CUSTOMIZATION_PREFERENCES,
      defaultValue: initialCardPreferences,
      localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.CARD_CUSTOMIZATION_PREFERENCES}`,
    });

  const [attributes, setAttributes] = useQueryParamState<PersonAttribute[]>({
    key: OrgChartQueryParamKeys.ATTRIBUTES,
    defaultValue: initialAttributes,
    localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.ATTRIBUTES}`,
  });

  const [highlighted, setHighlighted] = useQueryParamState<PersonAttribute>({
    key: OrgChartQueryParamKeys.HIGHLIGHTED,
    defaultValue: '',
    localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.HIGHLIGHTED}`,
  });

  const [focusedEmployeeId, setFocusedEmployeeId] = useQueryParamState<string>({
    key: OrgChartQueryParamKeys.EMPLOYEE,
  });

  const [spotlight, setSpotlight] = useQueryParamState<string>({
    key: OrgChartQueryParamKeys.SPOTLIGHT,
    defaultValue: '',
    // Disables local storage
    // localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.SPOTLIGHT}`,
  });

  const [spotlightVisibleRelationships, setSpotlightVisibleRelationships] =
    useQueryParamState<string[]>({
      key: OrgChartQueryParamKeys.SPOTLIGHT_VISIBLE_RELATIONSHIPS,
      defaultValue: [],
      // Disables local storage
      // localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.SPOTLIGHT_VISIBLE_RELATIONSHIPS}`,
    });

  const [sortByAttribute, setSortByAttribute] = useQueryParamState<boolean>({
    key: OrgChartQueryParamKeys.SORT_BY_ATTRIBUTE,
    defaultValue: false,
    localStorageKeyPrefix: `${LOCAL_STORAGE_PREFIX}.${OrgChartQueryParamKeys.SORT_BY_ATTRIBUTE}`,
  });

  useGetEmployeeListColumns({
    requestQuery: {
      enrich_employee_info_attributes: true,
    },
    enabled: attributes?.length > 0 || filters?.length > 0 || !!highlighted,
    onSuccess: (data) => {
      const columns = conditionallyAddJobAttributes(data.data);
      const attributeIds = (columns || []).map((d) => d.value);
      const filteredAttr = attributes.map((attr) => {
        if (attributeIds.includes(attr)) return attr;
        return '';
      });

      if (JSON.stringify(attributes) !== JSON.stringify(filteredAttr)) {
        setAttributes(filteredAttr);
      }
      if (highlighted && !attributeIds.includes(highlighted)) {
        setHighlighted('');
      }
      if (filters?.length > 0) {
        const filteredFilters = filters.filter((f) =>
          attributeIds.includes(f.id),
        );

        if (JSON.stringify(filteredFilters) !== JSON.stringify(filters)) {
          setFilters(filteredFilters);
        }
      }
    },
  });

  const handleSetFilters = (newFilters: ColumnFilter[]) => {
    track(Amp.APPLIED_FILTER, {
      attributes: newFilters?.map((f) => f.id) || [],
    });
    setFilters(newFilters || []);
  };

  const handleSetAttributes = (newAttributes: PersonAttribute[]) => {
    track(Amp.UPDATED_ATTRIBUTE, {
      attributes: newAttributes?.map((a) => String(a)) || [],
    });
    setAttributes(newAttributes);
  };

  const handleSetHighlighted = (newHighlighted: string) => {
    track(Amp.UPDATED_ATTRIBUTE, {
      attributes: [newHighlighted],
    });
    setHighlighted(newHighlighted);
  };

  const handleSetSpotlight = (newSpotlight: string, from = '') => {
    console.log('[] setting spotlight ', newSpotlight, from);
    if (newSpotlight) {
      track(Amp.SPOTLIGHTED_PERSON, { spotlight_source: from });
    }
    // setSpotlight(newSpotlight);
  };

  const handleSetView = (newView: View | null) => {
    track(Amp.APPLIED_VIEW, {
      view: newView,
    });
    setView(newView);
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters: handleSetFilters,
    view,
    setView: handleSetView,
    cardPreferences,
    setCardPreferences,
    attributes,
    setAttributes: handleSetAttributes,
    highlighted,
    setHighlighted: handleSetHighlighted,
    focusedEmployeeId,
    setFocusedEmployeeId,
    spotlight: isSpotlightFFEnabled ? spotlight : '',
    setSpotlight: handleSetSpotlight,
    spotlightVisibleRelationships,
    setSpotlightVisibleRelationships,
    sortByAttribute,
    setSortByAttribute,
  };
};

const OrgChartPreferencesContext = createContext<
  OrgChartPreferences | undefined
>(undefined);

export const useOrgChartPreferencesContext = () => {
  const context = useContext(OrgChartPreferencesContext);

  if (context === undefined) {
    throw new Error(
      'useOrgChartPreferencesContext must be used within an OrgChartPreferencesProvider',
    );
  }

  return context;
};

export const OrgChartPreferencesProvider = ({
  children,
  ...preferences
}: PropsWithChildren<OrgChartPreferences>) => (
  <OrgChartPreferencesContext.Provider value={preferences}>
    {children}
  </OrgChartPreferencesContext.Provider>
);
