import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import type { AxiosError } from '@personio/request';
import { useQueryClient } from 'react-query';
import { icons } from 'designSystem/component/icon';
import { IconButton } from 'designSystem/component/button';
import { FormField } from 'designSystem/component/form-field';
import { Select } from 'designSystem/component/select';
import { toaster } from 'designSystem/component/toaster';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Sidepanel } from '@personio-web/payroll-component-sidepanel';
import { ControlledSelect } from '@personio-web/payroll-component-controlled-select';
import { CreateEmployerPensionSchemeBody } from 'payroll/data/payroll-me';
import { useCreateEmployerPensionScheme as useCreateEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import { createEmployerPensionSchemeAPI as createEmployerPensionSchemeAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapMutation } from '../../../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../../../hooks/usePayrollGbBreadcrumbsNavigation';

type ServerError = { detail?: string; errors?: { title: string }[] };

const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Error with BACS Payment File',
    description:
      error.response?.data.errors?.[0].title ?? error.response?.data.detail,
    showCloseButton: true,
  });
};

export const CreatePensionScheme = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<CreateEmployerPensionSchemeBody>();
  const { legalEntityId } = useGbNavigation();
  const { mutateAsync } = useWrapMutation(
    useCreateEmployerPensionScheme,
    createEmployerPensionSchemeAPI,
  );

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [createEmployerPensionSchemeAPI.KEY],
    });
    router.push({ query: { ...router.query, slug: ['manage', 'pension'] } });
  };

  const handleSubmit = (data: CreateEmployerPensionSchemeBody) => {
    if (!legalEntityId) return;
    mutateAsync({ requestBody: { ...data, legalEntityId } })
      .then(handleSuccess)
      .catch(handleError);
  };

  return (
    <Sidepanel visibility="show" onClose={() => ''}>
      <Sidepanel.Header>
        <IconButton aria-label="close" icon={icons.cross} />
      </Sidepanel.Header>
      <Sidepanel.Content>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ControlledSelect<CreateEmployerPensionSchemeBody> name="providerType">
              <Select.TriggerValue placeholder="Select a provider type" />
              <Select.Viewport>
                <Select.Item value="AVIVA">Aviva</Select.Item>
                <Select.Item value="NEST">Nest</Select.Item>
                <Select.Item value="OTHER">Other</Select.Item>
              </Select.Viewport>
            </ControlledSelect>
            <FormField.Input
              title="Provider name"
              {...form.register('providerName')}
            />
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
