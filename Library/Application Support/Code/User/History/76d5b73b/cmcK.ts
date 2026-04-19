import { format, isValid } from 'date-fns';

import { Attribute } from '../../../../../@types';
import { SupportedUniversalId } from '../../GeneralSettings.constants';
import { CoreAttributesFormValues } from '../../types';

const parseValueToPayload = (universalId: string, value: unknown) => {
  switch (universalId) {
    case SupportedUniversalId.TenantFirstPayrollDate:
      return isValid(value) ? format(value as Date, 'yyyy-MM') : '';
    default:
      return value ? value.toString().trim() : '';
  }
};

const isValidDate = (date: string) => isValid(new Date(date));

const getParsedAttributeValue = (attribute: Attribute) => {
  switch (attribute.type) {
    case 'date-month':
      return isValidDate(attribute.value) ? new Date(attribute.value) : null;
    case 'string':
    default:
      return attribute.value.toString();
  }
};

export const mapCoreAttributesFormToPayload = (
  data: CoreAttributesFormValues,
): Array<Pick<Attribute, 'universalId' | 'value'>> => {
  return Object.entries(data).map(([key, value]) => ({
    universalId: key,
    value: parseValueToPayload(key, value),
  }));
};

export const mapAttributesToFormValues = (attributes: Array<Attribute>) =>
  attributes.reduce(
    (defaultValues, attribute) => ({
      ...defaultValues,
      [attribute.universalId]: getParsedAttributeValue(attribute),
    }),
    {},
  );

export const getComponentType = (attribute: Attribute) => {
  if (
    attribute.universalId === SupportedUniversalId.LIDSExportNotificationEmail
  ) {
    return 'email';
  }
  return attribute.type;
};

export const shouldOpenDialogOnLoad = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const shouldOpenDialog = searchParams.get('editCoreAttributes');

  return shouldOpenDialog === 'true';
};
