import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type {
  BreadcrumbDropdownItem,
  BreadcrumbSchemaItem,
} from 'designSystem/component/page-shell';
import type { PayrollContext } from '@personio-web/payroll-data-payroll-integration-context';
import {
  createUrl,
  deleteParam,
  getParams,
  setParam,
} from '../../utils/navigationParams';

export const getAvailablePayGroups = (
  onClick: (selectedPayGroup: string) => void,
  context?: PayrollContext['xero'],
): BreadcrumbDropdownItem[] => {
  if (!context || !context.xeroContext) return [];

  const { groupingActive, mappings } = context.xeroContext.settings.payPeriods;

  if (!groupingActive) return [];

  return mappings.map((mapping) => ({
    id: mapping.attribute.value,
    label: mapping.attribute.label,
    onClick: () => onClick(mapping.attribute.value),
  }));
};

export const usePayGroupsBreadcrumb = (
  context?: PayrollContext['xero'],
): BreadcrumbSchemaItem | null => {
  const router = useRouter();

  const { legalEntityId, payGroup } = getParams(router.query);
  const availablePayGroups = getAvailablePayGroups(
    (selectedPaygroup: string) => {
      const newUrl = createUrl(false);
      setParam(newUrl, 'payGroup', selectedPaygroup);
      router.replace(newUrl);
    },
    context,
  );

  // if the context is initially loaded (or changes), navigate to the pay group from the query (if it exists)
  useEffect(() => {
    if (!legalEntityId || !context || !context.xeroContext) return;

    const { payPeriods } = context.xeroContext.settings;
    const exists = availablePayGroups.find((group) => group.id === payGroup);

    const newUrl = createUrl(false);

    if ((!exists || !payGroup) && payPeriods.groupingActive)
      setParam(newUrl, 'payGroup', availablePayGroups[0].id);
    else if (payGroup && !payPeriods.groupingActive)
      deleteParam(newUrl, 'payGroup');

    router.replace(newUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, legalEntityId, payGroup]);

  if (!context || !context.xeroContext) return { loadingWidth: 100 };

  if (
    availablePayGroups.length <= 1 ||
    !context.xeroContext.settings.payPeriods.groupingActive
  )
    return null;

  const selectedOption =
    availablePayGroups.find((group) => group.id === payGroup) ||
    availablePayGroups[0];

  return {
    id: 'pay_groups',
    label: selectedOption.label,
    isVisible: true,
    dropdownItems: availablePayGroups,
  };
};
