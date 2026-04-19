import {
  type Google_Type_Date,
  type CustomAttribute,
  type EmploymentDataFragment,
} from '@personio-web/employees-organizations-data-gofer-types';
import { type ListEmploymentsByPersonIdsQueryResult } from '@personio-web/employees-organizations-gofer';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';

import {
  type AllowedCardSystemAttribute,
  type AllowedHighlightSystemAttribute,
  type Attribute,
  type AttributeParser,
  type EntityItem,
  PositionAttribute,
  type PositionData,
} from '../types';

type Nullable<T> = { [K in keyof T]?: T[K] | null };

type Custom = NonNullable<
  NonNullable<
    ListEmploymentsByPersonIdsQueryResult['employments']
  >['items'][number]['personEntity']
>['customAttributes'];

type AttributeId = PersonSystemAttribute | PositionAttribute | string;

export const customAttributePrefix = 'dynamic_';
const MAX_TIMESTAMP_IN_SECONDS = 9999999999;

function getSimpleAttribute<TData extends object = EmploymentDataFragment>(
  id: AttributeId,
  getter: (data?: TData) => string | null | undefined,
): AttributeParser<TData> {
  return (data, loading) => {
    const value = getter(data);

    if (value) {
      return {
        id,
        value: value,
        label: value,
        // TODO: handle accessibility
        isNotVisible: false,
      };
    }

    if (loading) {
      return {
        id,
        isLoading: true,
      };
    }

    return { id };
  };
}

export function getDateAttribute<TData extends object = EmploymentDataFragment>(
  id: AttributeId,
  getter: (
    data?: TData,
  ) => Google_Type_Date | string | number | null | undefined,
): AttributeParser<TData> {
  return (employment, loading) => {
    const value = getter(employment);
    let dateValue = undefined;

    if (typeof value === 'string' || typeof value === 'number') {
      /*
       * An epoch with 10 digits (up to 9999999999) represents a timestamp with second specification.
       * However, the JS Date constructor requires the timestamp in milliseconds.
       * By multiplying by 1000, we get the timestamp in milliseconds, and it can be correctly parsed.
       */
      const dateInSeconds = MAX_TIMESTAMP_IN_SECONDS > Number(value);
      dateValue =
        value && new Date(dateInSeconds ? Number(value) * 1000 : value);
    } else if (value?.year && value.month && value.day) {
      dateValue = new Date(value.year, value.month, value.day);
    }

    if (dateValue) {
      return {
        id,
        value: dateValue,
        label: String(dateValue),
        // TODO: handle accessibility
        isNotVisible: false,
      };
    }

    if (loading) {
      return {
        id,
        isLoading: true,
      };
    }

    return { id };
  };
}

function getKeyValuePairAttribute<
  TData extends object = EmploymentDataFragment,
>(
  id: AttributeId,
  getter: (data?: TData) => Nullable<EntityItem> | null | undefined,
): AttributeParser<TData> {
  return (data, loading) => {
    const attribute = getter(data);

    if (attribute && attribute.id && attribute.name) {
      return {
        id,
        value: attribute.id,
        label: attribute.name,
        // TODO: handle accessibility
        isNotVisible: false,
      };
    }

    if (loading) {
      return {
        id,
        isLoading: true,
      };
    }

    return { id };
  };
}

function getKeyValuePairArrayAttribute<
  TData extends object = EmploymentDataFragment,
>(
  id: AttributeId,
  getter: (data?: TData) => (EntityItem | undefined | null)[] | undefined,
): AttributeParser<TData> {
  return (data, loading) => {
    const attribute = getter(data)?.filter(
      (item): item is EntityItem => !!item,
    );

    if (attribute?.length) {
      return {
        id,
        value: attribute,
        label: attribute.map((item) => item.name).join(', '),
        // TODO: handle accessibility
        isNotVisible: false,
      };
    }

    if (loading) {
      return {
        id,
        isLoading: true,
      };
    }

    return { id };
  };
}

export const personAttributeParser: Record<
  AllowedCardSystemAttribute | AllowedHighlightSystemAttribute,
  AttributeParser
> = {
  [PersonSystemAttribute.Email]: getSimpleAttribute(
    PersonSystemAttribute.Email,
    (employment) => employment?.person?.email?.value,
  ),
  [PersonSystemAttribute.Position]: getSimpleAttribute(
    PersonSystemAttribute.Position,
    (employment) => employment?.positionTitle?.value,
  ),
  [PersonSystemAttribute.Gender]: getSimpleAttribute(
    PersonSystemAttribute.Gender,
    (employment) => employment?.person?.gender?.value,
  ),
  [PersonSystemAttribute.EmploymentType]: getSimpleAttribute(
    PersonSystemAttribute.EmploymentType,
    (employment) => employment?.type?.value,
  ),
  [PersonSystemAttribute.HireDate]: getDateAttribute(
    PersonSystemAttribute.HireDate,
    (employment) => employment?.startDate?.value?.seconds,
  ),
  [PersonSystemAttribute.Team]: getKeyValuePairAttribute(
    PersonSystemAttribute.Team,
    (employment) => employment?.teamEntity,
  ),
  [PersonSystemAttribute.Office]: getKeyValuePairAttribute(
    PersonSystemAttribute.Office,
    (employment) => employment?.officeEntity,
  ),
  [PersonSystemAttribute.Department]: getKeyValuePairAttribute(
    PersonSystemAttribute.Department,
    (employment) => employment?.departmentEntity,
  ),
  [PersonSystemAttribute.LegalEntity]: getKeyValuePairAttribute(
    PersonSystemAttribute.LegalEntity,
    (employment) => employment?.legalEntityDetails,
  ),
  [PersonSystemAttribute.CostCenter]: getKeyValuePairArrayAttribute(
    PersonSystemAttribute.CostCenter,
    (employment) =>
      employment?.costCenters?.valueList?.map((item) => item?.costCenterEntity),
  ),
  [PersonSystemAttribute.JobName]: getKeyValuePairAttribute(
    PersonSystemAttribute.JobName,
    (employment) => employment?.jobEntity,
  ),
  [PersonSystemAttribute.JobFamily]: getKeyValuePairAttribute(
    PersonSystemAttribute.JobFamily,
    (employment) => employment?.jobEntity?.jobFamily,
  ),
  [PersonSystemAttribute.JobLevel]: getKeyValuePairAttribute(
    PersonSystemAttribute.JobLevel,
    (employment) => employment?.jobEntity?.level,
  ),
  [PersonSystemAttribute.JobTrack]: getKeyValuePairAttribute(
    PersonSystemAttribute.JobTrack,
    (employment) => employment?.jobEntity?.level?.track,
  ),
};

export const positionAttributeParser: Record<
  PositionAttribute,
  AttributeParser<PositionData>
> = {
  [PositionAttribute.StartDate]: getDateAttribute(
    PositionAttribute.StartDate,
    (position) => position?.budgetedStartDate as Google_Type_Date | undefined,
  ),
  [PositionAttribute.Department]: getKeyValuePairAttribute(
    PositionAttribute.Department,
    (position) => position?.department,
  ),
  [PositionAttribute.Team]: getKeyValuePairAttribute(
    PositionAttribute.Team,
    (position) => position?.team,
  ),
  [PositionAttribute.Office]: getKeyValuePairAttribute(
    PositionAttribute.Office,
    (position) => position?.office,
  ),
  [PositionAttribute.CostCenter]: getKeyValuePairArrayAttribute(
    PositionAttribute.CostCenter,
    (position) =>
      position?.costCenterAllocation?.costCenterContributionList?.map(
        (item) => item?.costCenterEntity,
      ),
  ),
  [PositionAttribute.JobName]: getKeyValuePairAttribute(
    PositionAttribute.JobName,
    (position) => position?.job,
  ),
  [PositionAttribute.JobFamily]: getKeyValuePairAttribute(
    PositionAttribute.JobFamily,
    (position) => position?.job?.jobFamily,
  ),
  [PositionAttribute.JobLevel]: getKeyValuePairAttribute(
    PositionAttribute.JobLevel,
    (position) => position?.job?.level,
  ),

  [PositionAttribute.JobTrack]: getKeyValuePairAttribute(
    PositionAttribute.JobTrack,
    (position) => position?.job?.level?.track,
  ),
};

export const getCustomPersonAttribute =
  (attributeId: string): AttributeParser =>
  (employment, loading) => {
    const customAttributes: Record<string, CustomAttribute> =
      employment?.personEntity?.customAttributes;

    const attribute =
      customAttributes &&
      Object.values(customAttributes).find(
        (item: CustomAttribute) =>
          item.globalId === attributeId.replace(customAttributePrefix, ''),
      );

    if (attribute) {
      let value: Attribute['value'] = attribute.stringValue;

      if (attribute.type === 'INT') {
        value = attribute.intValue;
      }

      if (attribute.type === 'DATE' && attribute.dateValue) {
        value = new Date(String(attribute.dateValue));
      }

      if (attribute.type === 'BOOLEAN') {
        value = attribute.booleanValue;
      }

      if (attribute.type === 'DOUBLE') {
        value = attribute.doubleValue;
      }

      return {
        id: attributeId,
        label: String(value),
        value,
        // TODO: handle accessibility
        isNotVisible: false,
      };
    }

    if (loading) {
      return {
        id: attributeId,
        isLoading: true,
      };
    }

    return {
      id: attributeId,
    };
  };

export const getPersonAttributeParser = (
  attributeId: AttributeId,
): AttributeParser => {
  let parser: AttributeParser | undefined = personAttributeParser[attributeId];

  if (!parser && attributeId.startsWith(customAttributePrefix)) {
    parser = getCustomPersonAttribute(attributeId);
  }

  if (!parser) {
    parser = () => ({ id: attributeId });
  }

  return parser;
};

export const getPositionAttributeParser = (
  attributeId: AttributeId,
): AttributeParser<PositionData> => {
  let parser: AttributeParser<PositionData> | undefined =
    positionAttributeParser[attributeId];

  if (!parser) {
    parser = () => ({ id: attributeId });
  }

  return parser;
};
