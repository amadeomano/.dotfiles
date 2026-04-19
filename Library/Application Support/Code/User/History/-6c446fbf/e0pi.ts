import type { PersonAttribute } from '@personio-web/employees-organizations-util-people';
import type { ColumnFilter } from 'designSystem/component/advanced-filter';
import type { CardsPreferences } from '@personio-web/employees-organizations-feature-org-chart';
import { OrgChartQueryParamKeys } from '../../types';
import type { Source, CardCustomisation } from './types';
import { createPreference } from './createPreference';
import { defaultState } from './constants';

export const source = createPreference<Source>({
  keyName: OrgChartQueryParamKeys.SOURCE,
  stateKey: 'source',
  defaultValue: defaultState,
  isSourceDependent: false,
});

export const focusedNode = createPreference<string | null>({
  keyName: OrgChartQueryParamKeys.ACTIVE_CARD_ID,
  stateKey: 'activeCardId',
  defaultValue: defaultState,
  isPersistable: false,
});

export const highlighted = createPreference<PersonAttribute>({
  keyName: OrgChartQueryParamKeys.HIGHLIGHTED,
  stateKey: 'highlighted',
  defaultValue: defaultState,
});

export const filters = createPreference<ColumnFilter[]>({
  keyName: OrgChartQueryParamKeys.FILTERS,
  stateKey: 'filters',
  defaultValue: defaultState,
  jsonParser: true,
});

/**
 * TODO: [OS-1440] migrate the CardPreferences type to the new customisation type.
 */
export const cardPreferences = createPreference<CardsPreferences>({
  keyName: OrgChartQueryParamKeys.CARD_CUSTOMIZATION_PREFERENCES,
  stateKey: 'cardPreferences',
  defaultValue: defaultState,
  jsonParser: true,
});

export const cardCustomisations = createPreference<CardCustomisation[]>({
  keyName: OrgChartQueryParamKeys.CARD_CUSTOMIZATIONS,
  stateKey: 'cardCustomisations',
  defaultValue: defaultState,
  jsonParser: true,
});

export const attributes = createPreference<PersonAttribute[]>({
  keyName: OrgChartQueryParamKeys.ATTRIBUTES,
  stateKey: 'attributes',
  defaultValue: defaultState,
  jsonParser: true,
});

export const spotlight = createPreference<string>({
  keyName: OrgChartQueryParamKeys.SPOTLIGHT,
  stateKey: 'spotlight',
  defaultValue: defaultState,
  isPersistable: false,
});

export const spotlightVisibleRelationships = createPreference<string[]>({
  keyName: OrgChartQueryParamKeys.SPOTLIGHT_VISIBLE_RELATIONSHIPS,
  stateKey: 'spotlightVisibleRelationships',
  defaultValue: defaultState,
  jsonParser: true,
  isPersistable: false,
});

export const expansionState = createPreference<string[]>({
  keyName: OrgChartQueryParamKeys.EXPANSION_STATE,
  stateKey: 'expansionState',
  defaultValue: defaultState,
  jsonParser: true,
  isPersistable: false,
  isURLRepresentable: false,
});

export const preferences = [
  source,
  focusedNode,
  highlighted,
  filters,
  cardPreferences,
  cardCustomisations,
  attributes,
  spotlight,
  spotlightVisibleRelationships,
  expansionState,
];
