import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import type { AxiosError } from '@personio-web/request';
import { useQueryClient } from 'react-query';
import { icons } from 'designSystem/component/icon';
import { IconButton } from 'designSystem/component/button';
import { FormField } from 'designSystem/component/form-field';
import { Select } from 'designSystem/component/select';
import { toaster } from 'designSystem/component/toaster';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Sidepanel } from '@personio-web/payroll-component-sidepanel';
import { ControlledSelect } from '@personio-web/payroll-component-controlled-select';
import { type CreateEmployerPensionSchemeBody } from 'payroll/data/payroll-me';
import { useCreateEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import {
  listEmployerPensionSchemesAPI,
  createEmployerPensionSchemeAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import {
  useGetDefaultHeaders,
  useWrapMutation,
} from '../../../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../../../hooks/usePayrollGbBreadcrumbsNavigation';
import { useEffect } from 'react';

type ServerError = { detail?: string; errors?: { title: string }[] };

const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Pension Schema Creation Error',
    description:
      error.response?.data.errors?.[0].title ?? error.response?.data.detail,
    showCloseButton: true,
  });
};

export const CreatePensionScheme = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<CreateEmployerPensionSchemeBody>();
  const errors = form.formState.errors;
  const { legalEntityId } = useGbNavigation();
  const defaultHeaders = useGetDefaultHeaders();
  const { mutateAsync } = useWrapMutation(
    useCreateEmployerPensionScheme,
    createEmployerPensionSchemeAPI,
  );

  const handleClose = () => {
    router.push({ query: { ...router.query, slug: ['manage', 'pension'] } });
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [listEmployerPensionSchemesAPI.KEY],
    });
    handleClose();
  };

  const handleSubmit = (data: CreateEmployerPensionSchemeBody) => {
    if (!legalEntityId) return;
    mutateAsync({
      requestBody: { ...data, legalEntityId },
      requestHeaders: defaultHeaders,
    })
      .then(handleSuccess)
      .catch(handleError);
  };

  const providerType = form.watch('providerType');
  useEffect(() => {
    if (providerType != 'OTHER') {
      form.setValue('providerName', '');
    }
  });
  const handleProviderTypeChange = (value: string) => {
    if (value !== 'OTHER') form.resetField('providerName');
  };

  return (
    <Sidepanel visibility="show" onClose={() => ''}>
      <Sidepanel.Header>
        <IconButton
          aria-label="close"
          icon={icons.cross}
          onClick={handleClose}
        />
      </Sidepanel.Header>
      <Sidepanel.Content>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField.Input
              title="Pension scheme name"
              {...form.register('pensionSchemeName')}
            />
            <ControlledSelect<CreateEmployerPensionSchemeBody>
              name="providerType"
              onValueChange={handleProviderTypeChange}
            >
              <Select.TriggerValue placeholder="Select a provider type" />
              <Select.Viewport>
                <Select.Item value="AVIVA">Aviva</Select.Item>
                <Select.Item value="NEST">Nest</Select.Item>
                <Select.Item value="OTHER">Other</Select.Item>
              </Select.Viewport>
            </ControlledSelect>
            {providerType == 'OTHER' && (
              <FormField.Input
                title="Provider name"
                {...form.register('providerName', {
                  required: 'Must specify provider name',
                })}
              />
            )}
            {errors.providerName && <span>{errors.providerName.message}</span>}
            <FormField.Input
              title="Provider reference"
              {...form.register('providerReference')}
            />
            <ActionBar>
              <Actions.Primary type="submit">Save</Actions.Primary>
            </ActionBar>
          </form>
        </FormProvider>
      </Sidepanel.Content>
    </Sidepanel>
  );
};
