import { useEffect } from 'react';
import type { AxiosError } from '@personio/request';
import {
  PropertyList,
  PropertyListItem,
  PropertyListItemLabel,
  PropertyListItemValue,
} from 'designSystem/component/property-list';
import { toaster } from 'designSystem/component/toaster';
import { Inline } from 'designSystem/component/layout';
import { icons } from 'designSystem/component/icon';
import { MetadataItem } from 'designSystem/component/metadata-item';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { useSaveSchemaMappings } from '@personio-web/payroll-data-payroll-me';
import { saveSchemaMappingsAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import type {
  ListCompensationTypesData,
  ListSchemaMappingsData,
  SaveSchemaMappingsBody,
  ListEmployerCompensationSchemasData,
} from '@personio-web/payroll-data-payroll-me';
import { FormProvider, useForm } from 'react-hook-form';
import { useGbNavigation } from '../../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useCompensationTypes } from './useCompensationTypes';
import { useEmployerCompensationSchemas } from './useEmployerCompensationSchemas';
import { useSchemaMappings } from './useSchemaMappings';
import { useWrapMutation } from '../../../hooks/temporary/useWrapQuery';

type FormData = SaveSchemaMappingsBody['mappings'];

const getSchemaName = (
  schemas: ListEmployerCompensationSchemasData,
  schemaId: string,
) => schemas.data.find(({ id }) => id === schemaId)?.description;

const getDefaultValues = (
  compensationTypes: ListCompensationTypesData,
  schemaMappings: ListSchemaMappingsData,
) =>
  compensationTypes.reduce<FormData>((acc, compensationType, index) => {
    const correspondingSchemaMapping = schemaMappings.data.find(
      ({ compensationTypeId }) => compensationTypeId === compensationType.key,
    );
    if (!correspondingSchemaMapping) return acc;
    acc[index] = {
      compensationTypeId: correspondingSchemaMapping.compensationTypeId,
      employerSchemaId: correspondingSchemaMapping.employerSchemaId,
    };
    return acc;
  }, []);

type ServerError = { detail?: string; errors?: { title: string }[] };
const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Compensation Mapping Error',
    description:
      error.response?.data.errors?.[0].title ??
      error.response?.data.detail ??
      String(error),
    showCloseButton: true,
  });
};

export const CompensationTab = () => {
  const { legalEntityId } = useGbNavigation();
  const { compensationTypes } = useCompensationTypes();
  const { compensationSchemas } = useEmployerCompensationSchemas(legalEntityId);
  const { schemaMappings } = useSchemaMappings(legalEntityId);
  const { mutateAsync: mutateMappings } = useWrapMutation(
    useSaveSchemaMappings,
    saveSchemaMappingsAPI,
  );
  const form = useForm<FormData>();

  useEffect(() => {
    if (compensationTypes && schemaMappings)
      form.reset(getDefaultValues(compensationTypes, schemaMappings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compensationTypes, schemaMappings]);

  if (!compensationTypes || !compensationSchemas || !schemaMappings) return;

  const compensationSchemaOptions =
    compensationSchemas?.data.map(({ id: value, description: label }) => ({
      value,
      label,
    })) ?? [];

  compensationTypes.forEach((_, index) =>
    form.watch(`${index}.employerSchemaId`),
  );

  const handleSuccess = () => {
    toaster.notify({
      variant: 'success',
      title: 'Successfully saved the mapping',
      showCloseButton: true,
    });
    form.reset(form.getValues());
  };

  const handleSumbit = () => {
    mutateMappings({
      requestBody: {
        legalEntityId: legalEntityId ?? '',
        mappings: Object.values(form.getValues()).filter(Boolean),
      },
    })
      .then(handleSuccess)
      .catch(handleError);
  };

  return (
    <>
      <p>
        For any company compensation types that will be used in UK Payrolls,
        select the associated payroll configuration
      </p>
      <Inline>
        <MetadataItem.Text
          icon={icons.compensation}
          label="Company compensation type"
        />
        <MetadataItem.Text
          icon={icons.compensation}
          label="Payroll configuration"
        />
      </Inline>
      <FormProvider {...form}>
        <PropertyList>
          {compensationTypes.map((compensationType, index) => (
            <PropertyListItem key={compensationType.key}>
              <PropertyListItemLabel>
                {compensationType.label}
              </PropertyListItemLabel>
              <PropertyListItemValue.Enum
                value={
                  getSchemaName(
                    compensationSchemas,
                    form.getValues(`${index}.employerSchemaId`),
                  ) ?? ''
                }
                editorProps={{
                  selected:
                    getSchemaName(
                      compensationSchemas,
                      form.getValues(`${index}.employerSchemaId`),
                    ) ?? '',
                  options: compensationSchemaOptions,
                }}
                onEdit={(schemaId) => {
                  form.setValue(
                    `${index}.compensationTypeId`,
                    compensationType.key,
                  );
                  form.setValue(`${index}.employerSchemaId`, schemaId);
                }}
              />
            </PropertyListItem>
          ))}
        </PropertyList>
        <ActionBar>
          <Actions.Secondary variant="ghost" onClick={() => form.reset()}>
            Cancel
          </Actions.Secondary>
          <Actions.Primary onClick={handleSumbit}>Save</Actions.Primary>
        </ActionBar>
      </FormProvider>
    </>
  );
};
