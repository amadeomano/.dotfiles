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
import { CreatePensionContributionGroupBody } from 'payroll/data/payroll-me';
import { useCreatePensionContributionGroup } from '@personio-web/payroll-data-payroll-me';
import {
  createPensionContributionGroupAPI,
  listPensionContributionGroupsAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { useWrapMutation } from '../../../hooks/temporary/useWrapQuery';
import { useContributionGroupNavigation } from './useContributionGroupsNavigation';

type ServerError = { detail?: string; errors?: { title: string }[] };
type FormData = CreatePensionContributionGroupBody & {
  contributionType: CreatePensionContributionGroupBody['employeeContribution']['contributionType'];
};

const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Contribution Group Creation Error',
    description:
      error.response?.data.errors?.[0].title ?? error.response?.data.detail,
    showCloseButton: true,
  });
};

export const CreateContributionGroup = () => {
  const { navigateToListing, getActiveSchemeId } =
    useContributionGroupNavigation();
  const queryClient = useQueryClient();
  const form = useForm<FormData>();
  const { mutateAsync } = useWrapMutation(
    useCreatePensionContributionGroup,
    createPensionContributionGroupAPI,
  );

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [listPensionContributionGroupsAPI.KEY],
    });
    navigateToListing();
  };

  const handleSubmit = ({ contributionType, ...requestBody }: FormData) => {
    const schemeId = getActiveSchemeId();
    const transformedRequestBody = { ...requestBody };
    if (!schemeId) return;
    mutateAsync({ requestBody, requestPathParams: { schemeId } })
      .then(handleSuccess)
      .catch(handleError);
  };

  return (
    <Sidepanel visibility="show" onClose={() => ''}>
      <Sidepanel.Header>
        <IconButton
          aria-label="close"
          icon={icons.cross}
          onClick={navigateToListing}
        />
      </Sidepanel.Header>
      <Sidepanel.Content>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField.Input
              title="Group name"
              {...form.register('groupName')}
            />
            <ControlledSelect<CreatePensionContributionGroupBody> name="earningsType">
              <Select.TriggerValue placeholder="Select an earning type" />
              <Select.Viewport>
                <Select.Item value="QUALIFYING">Qualifying</Select.Item>
                <Select.Item value="PENSIONABLE">Pensionable</Select.Item>
              </Select.Viewport>
            </ControlledSelect>
            <fieldset style={{ border: '1px solid #ccc' }}>
              <legend>Employee Contribution</legend>
              <ControlledSelect<CreatePensionContributionGroupBody> name="employeeContribution.contributionType">
                <Select.TriggerValue placeholder="Select a contribution type" />
                <Select.Viewport>
                  <Select.Item value="AMOUNT">Amount</Select.Item>
                  <Select.Item value="PERCENTAGE">Percentage</Select.Item>
                </Select.Viewport>
              </ControlledSelect>
              <FormField.Input
                title="Employee contribution"
                type="number"
                {...form.register('employeeContribution.contribution')}
              />
            </fieldset>
            <fieldset style={{ border: '1px solid #ccc' }}>
              <legend>Employer Contribution</legend>
              <ControlledSelect<CreatePensionContributionGroupBody> name="employerContribution.contributionType">
                <Select.TriggerValue placeholder="Select a contribution type" />
                <Select.Viewport>
                  <Select.Item value="AMOUNT">Amount</Select.Item>
                  <Select.Item value="PERCENTAGE">Percentage</Select.Item>
                </Select.Viewport>
              </ControlledSelect>
              <FormField.Input
                title="Employee contribution"
                type="number"
                {...form.register('employerContribution.contribution')}
              />
            </fieldset>
            <ControlledSelect<CreatePensionContributionGroupBody> name="taxationMethod">
              <Select.TriggerValue placeholder="Select an earning type" />
              <Select.Viewport>
                <Select.Item value="RELIEF_AT_SOURCE">
                  Relief at source
                </Select.Item>
                <Select.Item value="NET_PAY_ARRANGEMENT">
                  Net Pay Arrangement
                </Select.Item>
              </Select.Viewport>
            </ControlledSelect>
            <ActionBar>
              <Actions.Primary type="submit">Save</Actions.Primary>
            </ActionBar>
          </form>
        </FormProvider>
      </Sidepanel.Content>
    </Sidepanel>
  );
};
