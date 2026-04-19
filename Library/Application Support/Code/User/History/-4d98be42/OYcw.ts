import DataLoader from 'dataloader';

import {
  // goferClient,
  // ListEmploymentsByPersonIdsDocument,
  type EmploymentExpand,
  type EmploymentDataFragment,
  // type ListEmploymentsByPersonIdsQuery,
  // type ListEmploymentsByPersonIdsQueryVariables,
} from '@personio-web/employees-organizations-data-gofer';
import {
  ListEmploymentsByPersonIds,
  type ListEmploymentsByPersonIdsQueryResult,
  type ListEmploymentsByPersonIdsQueryVariables,
} from '@personio-web/employees-organizations-gofer';
import { goferRequest } from '@personio-web/gofer/src/client/client';
import { getQueryKeyForDocument } from '@personio-web/gofer/src/query/utils/getQueryKeyForDocument';
import { type PersonExpand } from '@personio-web/employees-organizations-data-gofer-types';
import {
  type PersonAttribute,
  PersonSystemAttribute,
} from '@personio-web/employees-organizations-util-people';

const MAX_BATCH_SIZE = 50;
const CUSTOM_ATTRIBUTE_PREFIX = 'dynamic_';

type Employment = NonNullable<
  ListEmploymentsByPersonIdsQueryResult['employments']
>['items'][number];

export type PersonCardDataLoaderArgs = {
  companyId: number;
  attributeIds?: PersonAttribute[];
  additionalSupervisorAttributeIds?: string[];
};

export type PersonCardDataLoader = DataLoader<string, Employment>;

type IncludeAttributes = Pick<
  ListEmploymentsByPersonIdsQueryVariables,
  | 'includeDepartment'
  | 'includeTeam'
  | 'includeOffice'
  | 'includeLegalEntityDetails'
  | 'includeCostCenters'
  | 'includeEmploymentDates'
  | 'includePersonEntity'
  | 'includeCustomAttributes'
  | 'includeSubordinates'
  | 'includeJob'
>;

const attributeMap: Record<string, keyof IncludeAttributes> = {
  [PersonSystemAttribute.Department]: 'includeDepartment',
  [PersonSystemAttribute.Team]: 'includeTeam',
  [PersonSystemAttribute.Office]: 'includeOffice',
  [PersonSystemAttribute.LegalEntity]: 'includeLegalEntityDetails',
  [PersonSystemAttribute.CostCenter]: 'includeCostCenters',
  [PersonSystemAttribute.HireDate]: 'includeEmploymentDates',
  [PersonSystemAttribute.JobName]: 'includeJob',
  [PersonSystemAttribute.JobFamily]: 'includeJob',
  [PersonSystemAttribute.JobTrack]: 'includeJob',
  [PersonSystemAttribute.JobLevel]: 'includeJob',
};

const employmentExpandMap: Record<string, EmploymentExpand> = {
  [PersonSystemAttribute.CostCenter]: 'COST_CENTERS',
};

/**
 * Batch function for DataLoader that fetches employment data for multiple persons.
 *
 * This function receives an array of person IDs, makes a single GraphQL query
 * to fetch employment data for all these IDs, and then maps the results back
 * to the corresponding person ID. This helps in reducing the number of
 * network requests by batching them into a single request.
 */
function getPersonCardDataLoaderBatchFn({
  companyId,
  attributeIds,
  additionalSupervisorAttributeIds,
}: PersonCardDataLoaderArgs) {
  const employmentExpand: EmploymentExpand[] = ['PERSON'];
  const personExpand: PersonExpand[] = ['PERSON_CUSTOM_ATTRIBUTES'];
  const includeAttributes: IncludeAttributes = {};

  if (attributeIds?.length) {
    attributeIds.forEach((attributeId) => {
      const includeKey = attributeMap[attributeId];
      if (includeKey) {
        includeAttributes[includeKey] = true;
      }

      const expandValue = employmentExpandMap[attributeId];
      if (expandValue && !employmentExpand.includes(expandValue)) {
        employmentExpand.push(expandValue);
      }

      if (
        !includeAttributes.includeCustomAttributes &&
        attributeId.startsWith(CUSTOM_ATTRIBUTE_PREFIX)
      ) {
        includeAttributes.includePersonEntity = true;
        includeAttributes.includeCustomAttributes = true;
      }
    });
  }

  if (additionalSupervisorAttributeIds?.length) {
    includeAttributes.includePersonEntity = true;
    includeAttributes.includeCustomAttributes = true;
    includeAttributes.includeSubordinates = true;
    personExpand.push('PERSON_EXPAND_DIRECT_ADDITIONAL_SUBORDINATES');
  }

  return async function personCardDataLoaderBatchFn(
    personIds: readonly string[],
  ): Promise<Employment[]> {
    if (personIds.length === 0) {
      return [];
    }

    // Execute a GraphQL query to fetch employment data for the given person IDs.
    const result = await goferRequest({
      operation: ListEmploymentsByPersonIds,
      options: {
        companyId,
        variables: {
          companyId,
          personIds: personIds as string[],
          employmentExpand,
          personExpand,
          ...includeAttributes,
        },
      },
    });
    // const result = await goferClient.query<
    //   ListEmploymentsByPersonIdsQuery,
    //   ListEmploymentsByPersonIdsQueryVariables
    // >({
    //   query: ListEmploymentsByPersonIdsDocument,
    //   variables: {
    //     companyId,
    //     personIds: personIds as string[],
    //     employmentExpand,
    //     personExpand,
    //     ...includeAttributes,
    //   },
    // });

    const employmentsMap: Record<string, Employment> =
      result.data?.employments?.items?.reduce(
        (rest, employment) => ({
          ...rest,
          ...(employment?.person ? { [employment.person.id]: employment } : {}),
        }),
        {},
      ) ?? {};

    // Map the original person IDs to the corresponding employment data from the map.
    return personIds.map((personId) => employmentsMap?.[personId] || null);
  };
}

/**
 * DataLoader instance for fetching employment data for person cards.
 *
 * DataLoader batches multiple requests for employment data within the same
 * execution frame into a single request, optimizing network usage and reducing
 * load times. This instance is used to load employment data based on person IDs.
 *
 * Usage:
 * `const employment = await personCardDataLoader.load(personId)`
 */
export const getPersonCardDataLoader = (
  options: PersonCardDataLoaderArgs,
): DataLoader<string, Employment> =>
  new DataLoader(getPersonCardDataLoaderBatchFn(options), {
    name: 'personCardDataLoader',
    maxBatchSize: MAX_BATCH_SIZE,
  });
