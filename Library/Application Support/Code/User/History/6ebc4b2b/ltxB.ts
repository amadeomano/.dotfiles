import { type Attribute } from '@personio-web/employees-organizations-hook-use-people-filter-config-types';
import { type HierarchicalOrgUnitGofer } from '@personio-web/employees-organizations-hook-use-query-org-units';
import { type PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';
import type {
  FilterOption,
  FilterConfig,
  SelectFilterConditions,
} from 'designSystem/component/advanced-filter';

type attributeId =
  | PersonSystemAttribute.Team
  | PersonSystemAttribute.Department;
const mapHierarchicalOptions = (
  items: HierarchicalOrgUnitGofer[] = [],
): FilterOption[] => {
  return items.map<FilterOption>(({ id, data, children }) => ({
    id: id.toString(),
    value: id.toString(),
    label: data.name,
    ...(children && {
      subOptions: mapHierarchicalOptions(children),
    }),
  }));
};

export const createOrgUnitsFilterConfig = (
  attributeId: PersonSystemAttribute.Team | PersonSystemAttribute.Department,
  allowEmptyValue: boolean,
  emptyLabel: string,
  select?: Attribute['select'],
  conditions: SelectFilterConditions = ['contains'],
  options: HierarchicalOrgUnitGofer[] = [],
): FilterConfig => ({
  columnId: attributeId,
  field: 'multiselect',
  conditions,
  getOptions: () => {
    let _options = mapHierarchicalOptions(options);

    if (allowEmptyValue) {
      _options = [
        {
          id: '',
          value: '',
          label: emptyLabel,
        },
        ..._options,
      ];
    }

    return Promise.resolve(select ? select(_options) : _options);
  },
});
