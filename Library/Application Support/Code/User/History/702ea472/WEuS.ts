import { useEffect, useMemo, useState } from 'react';

import {
  type CustomAttribute,
  type EmploymentDataFragment,
} from '@personio-web/employees-organizations-data-gofer';
import { type ListEmploymentsByPersonIdsQueryResult } from '@personio-web/employees-organizations-gofer';
import type { PersonAttribute } from '@personio-web/employees-organizations-util-people';

import type { AdditionalRelationship, Attribute } from '../types';

import { getPersonAttributeParser } from '../utils';
import { usePersonCardDataLoader } from './usePersonCardDataLoader';

type Employment = NonNullable<
  ListEmploymentsByPersonIdsQueryResult['employments']
>['items'][number];

type useGetPersonCardDataOptions = {
  enabled?: boolean;
  attributeIds?: PersonAttribute[];
  additionalSupervisorAttributeIds?: string[];
};

export function useGetPersonCardData(
  personId?: string,
  {
    enabled,
    attributeIds,
    additionalSupervisorAttributeIds,
  }: useGetPersonCardDataOptions = {},
) {
  const { personCardDataLoader } = usePersonCardDataLoader();
  const [employment, setEmployment] = useState<Employment | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!personId || enabled === false) {
      return;
    }

    const fetchEmployment = async () => {
      setLoading(true);
      try {
        console.log('[] requesting for ', personId);
        const employment = await personCardDataLoader.load(personId);
        if (employment === null) {
          personCardDataLoader.clear(personId);
        }
        setEmployment(employment);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployment();
  }, [enabled, personCardDataLoader, personId]);

  const attributes: Attribute[] | undefined = useMemo(() => {
    if (!attributeIds?.length) {
      return undefined;
    }

    return attributeIds.map((id) =>
      getPersonAttributeParser(id)(employment, loading),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(attributeIds), employment, loading]);

  const additionalRelationships = useMemo<
    AdditionalRelationship[] | undefined
  >(() => {
    if (!additionalSupervisorAttributeIds?.length || !employment) {
      return undefined;
    }

    const relationships: AdditionalRelationship[] = [];

    const customAttributes = employment.personEntity?.customAttributes as
      | Record<string, CustomAttribute>
      | undefined;

    if (customAttributes) {
      additionalSupervisorAttributeIds.forEach((attributeId) => {
        // Overwrite because value doesn't match expected shape
        const attribute = customAttributes[attributeId]?.arrayValue as
          | { stringValue: string[] | undefined }
          | undefined;

        if (attribute) {
          attribute.stringValue?.forEach((supervisorId) => {
            if (supervisorId) {
              const relationship: AdditionalRelationship = {
                attributeId,
                personId: supervisorId,
                type: 'supervisor',
              };

              relationships.push(relationship);
            }
          });
        }
      });
    }

    employment.personEntity?.subordinates?.valueList?.forEach((subordinate) => {
      const supervisorTypeId = subordinate?.supervisorTypeId;

      if (
        supervisorTypeId &&
        subordinate.personId &&
        additionalSupervisorAttributeIds.includes(supervisorTypeId)
      ) {
        const relationship: AdditionalRelationship = {
          attributeId: supervisorTypeId,
          personId: subordinate.personId,
          type: 'subordinate',
        };

        relationships.push(relationship);
      }
    });

    return relationships;
  }, [additionalSupervisorAttributeIds, employment]);

  const isAccessible = useMemo(
    /*
     * If the principal does not have access to the employment's data, it's data is not returned.
     * No error or specific message is send to avoid leaking data.
     */
    () => loading || employment !== null,
    [loading, employment],
  );

  return {
    person: employment?.person,
    status: employment?.status?.value ?? undefined,
    additionalRelationships,
    attributes,
    isAccessible,
    loading,
    error,
  };
}
