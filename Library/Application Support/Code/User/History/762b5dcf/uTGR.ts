import type { Dispatch, SetStateAction } from 'react';
import type { IconSVGComponent } from '@personio-web/design-system-component-icon-types';
import { type UseHierarchicalDataReturnType } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import type { ColumnConfig } from 'designSystem/component/advanced-filter';
import { type PickerOption } from 'designSystem/component/picker';

import type { ParseKeys } from 'i18next';
import type { ParseKeysByKeyPrefix } from 'i18next/typescript/t';

import {
  type EntityNode,
  type OrgChartFilter,
  type OrgChartPreferences,
  type PersonFilterableAttribute,
  type View,
} from '../types';

export type EmploymentBaseData = {
  team?: string;
  department?: string;
  office?: string;
};

export type ViewConfig = {
  id: View;
  name: ParseKeysByKeyPrefix<
    ParseKeys<'employees-organizations'>,
    'org-chart.control-bar'
  >;
  icon: IconSVGComponent;
  filterConditions?: OrgChartFilter[];
};

export type FilterColumnsConfig = ColumnConfig & {
  id: PersonFilterableAttribute;
};

export type ControlBarProps = OrgChartPreferences & {
  spotlightPersonName?: string;
  searchResults?: PickerOption[];
  onSearchResultSelect?: (searchResult: string) => void;
  areSearchResultsLoading?: boolean;
  hierarchy: UseHierarchicalDataReturnType<EntityNode>;
  additionalSupervisorAttributes?: Record<string, string>;
  setIsExporting: Dispatch<SetStateAction<Boolean>>;
};
