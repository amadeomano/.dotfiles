import { FormProvider, useForm } from 'react-hook-form';
import { icons } from 'designSystem/component/icon';
import { IconButton } from 'designSystem/component/button';
import { FormField } from 'designSystem/component/form-field';
import { Select } from 'designSystem/component/select';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Sidepanel } from '@personio-web/payroll-component-sidepanel';
import { ControlledSelect } from '@personio-web/payroll-component-controlled-select';
import { CreateEmployerPensionSchemeBody } from 'payroll/data/payroll-me';
import { useCreateEmployerPensionScheme as useCreateEmployerPensionScheme } from '@personio-web/payroll-data-payroll-me';
import { createEmployerPensionSchemeAPI as createEmployerPensionSchemeAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapMutation } from '../../../hooks/temporary/useWrapQuery';
import { useGbNavigation } from '../../hooks/usePayrollGbBreadcrumbsNavigation';

export const CreatePensionScheme = () => {
  const form = useForm<CreateEmployerPensionSchemeBody>();
  const { groupId, period } = useGbNavigation();
  const { mutateAsync } = useWrapMutation(
    useCreateEmployerPensionScheme,
    createEmployerPensionSchemeAPI,
  );
  const handleSubmit = (data: CreateEmployerPensionSchemeBody) => {
    console.log(data);
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
