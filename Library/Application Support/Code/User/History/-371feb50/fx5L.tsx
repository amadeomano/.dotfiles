import { type HierarchicalOrgUnit } from '@personio-web/employees-organizations-data-org-units-types';
import type { OrgUnitsSelectProps } from '@personio-web/employees-organizations-feature-org-units-select';
import { useQueryOrgUnits } from '@personio-web/employees-organizations-hook-use-query-org-units';
import classnames from 'classnames';
import { Icon, icons } from 'designSystem/component/icon';
import { Input } from 'designSystem/component/input';
import { MultiSelect } from 'designSystem/component/multi-select';
import { Popover } from 'designSystem/component/popover';
import { useTranslation } from 'react-i18next';

import { useGetSelectedDisplayValue } from './hooks';
import styles from './OrgUnitsSelect.module.scss';
import { OrgUnitsSelectError } from './OrgUnitsSelectError';
import { OrgUnitsSelectLoading } from './OrgUnitsSelectLoading';
import { transformHierarchicalOrgUnitsToSelect } from './utils';

const MAX_DEPTH = 10;

export const OrgUnitsSelect = ({
  id = 'orgUnitSelectInput',
  name = 'orgUnitSelectInput',
  type,
  onChange,
  selectedOptionIds = [],
  disabled,
  placeholder,
  isLegacyExperience = false,
  className,
  popoverContentClassName,
  singleSelect,
  footer,
  currentOrgUnitId,
  metadata,
  addEmptyOption = false,
  ...rest
}: OrgUnitsSelectProps) => {
  const { t } = useTranslation('org-units');
  // Force fetching the translations early to avoid the UI from flickering when the select is clicked
  useTranslation('design-system');

  const { orgUnits, getOrgUnit, isLoading, isError } = useQueryOrgUnits({
    type,
    queryConfig: {
      autoFetchNextPage: true,
      initialMaxDepthLoad: MAX_DEPTH,
      additionalParams: {
        include_direct_descendants_count: true,
      },
    },
  });

  const emptyTranslation = t('select.empty');
  const emptyOption = {
    id: '-1',
    value: emptyTranslation,
    name: emptyTranslation,
  };
  const transformedOrgUnits = transformHierarchicalOrgUnitsToSelect(
    orgUnits,
    currentOrgUnitId,
  );
  const transformedOrgUnitsItems = addEmptyOption
    ? [emptyOption, ...transformedOrgUnits]
    : transformedOrgUnits;

  const getSelectedOrgUnits = (selectedOrgUnitIds: string[]) =>
    selectedOrgUnitIds
      .map((id) => (addEmptyOption ? emptyOption : getOrgUnit(id)?.data))
      .filter((orgUnit): orgUnit is HierarchicalOrgUnit['data'] =>
        Boolean(orgUnit),
      );

  const displayValue = useGetSelectedDisplayValue({
    selectedOrgUnits: getSelectedOrgUnits(selectedOptionIds),
    placeholder,
    isLegacyExperience,
    type,
    singleSelect,
  });

  const isFirefox = navigator.userAgent.includes('Firefox');

  return (
    <Popover>
      <Popover.Trigger className={className}>
        <Input
          id={id}
          name={name}
          className={classnames(
            { [styles.orgUnitSelectTrigger]: !isLegacyExperience },
            { [styles.legacySelectTrigger]: isLegacyExperience },
          )}
          aria-label={placeholder}
          role="combobox"
          disabled={
            Boolean(isLoading && !transformedOrgUnitsItems.length) || disabled
          }
          suffix={
            <Icon className={styles.selectIcon} icon={icons.chevronDown} />
          }
          value={displayValue}
          metadata={metadata}
        />
      </Popover.Trigger>
      <Popover.Content
        className={classnames(styles.popoverContent, popoverContentClassName, {
          [styles.legacyPopoverContent]: isLegacyExperience,
          [styles.limitTriggerWidth]: singleSelect,
        })}
        align="start"
      >
        <MultiSelect
          {...rest}
          singleSelect={singleSelect}
          selectedOptionIds={selectedOptionIds}
          options={transformedOrgUnitsItems}
          onChange={(selectedOptionIds) => {
            onChange(selectedOptionIds, getSelectedOrgUnits(selectedOptionIds));
          }}
          enableExpanding
          metadata={metadata}
          autoFocus={isFirefox ? false : undefined}
        />
        {isLegacyExperience && footer && (
          <Popover.Close>
            <div className={styles.legacyFooter}>{footer}</div>
          </Popover.Close>
        )}
        {isLoading && <OrgUnitsSelectLoading />}
        {isError && <OrgUnitsSelectError />}
      </Popover.Content>
    </Popover>
  );
};
