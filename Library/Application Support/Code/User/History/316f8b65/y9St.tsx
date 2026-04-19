import { useState, FC } from 'react';
import type { AxiosError } from '@personio/request';
import { useQueryClient } from 'react-query';
import { usePayrollRunNavigation } from '../usePayrollRunNavigation';
import { FormProvider, useForm } from 'react-hook-form';
import { FormField } from 'designSystem/component/form-field';
import { Dialog } from 'designSystem/component/dialog';
import { Select } from 'designSystem/component/select';
import { toaster } from 'designSystem/component/toaster';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { ControlledSelect } from '@personio-web/payroll-component-controlled-select';
import { useCreateEmployeePension } from '@personio-web/payroll-data-payroll-me';
import { createEmployeePensionAPI } from '@personio-web/payroll-data-payroll-me/src/common';
import { CreateEmployeePensionBody } from 'payroll/data/payroll-me';
import { useEmployerPensionSchemes } from '../../ManageTab/PensionSchemasSettings/useEmployerPensionSchemes';
import { useContributionGroups } from '../../ManageTab/PensionSchemeContributionGroupsSettings/useContributionGroups';
import { useWrapMutation } from '../../../hooks/temporary/useWrapQuery';

type ServerError = { detail?: string; errors?: { title: string }[] };
type FormData = CreateEmployeePensionBody & {
  contributionType: NonNullable<
    CreateEmployeePensionBody['employeeContributionOverride']
  >['contributionType'];
};

const dateFormatter = new Intl.DateTimeFormat('fr-CA', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Contribution Group Creation Error',
    description:
      error.response?.data.errors?.[0].title ?? error.response?.data.detail,
    showCloseButton: true,
  });
};

export const AllocateContributionGroup: FC = () => {
  const {
    isInAllocate,
    activeEmployeeId,
    navigateToEmployee,
    navigateToListing,
  } = usePayrollRunNavigation();

  const [selectedScheme, setSelectedScheme] = useState<string | undefined>();
  const [effectiveDate, setEffectiveDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [overrideContribution, setOverrideContribution] =
    useState<boolean>(false);
  const [contributionFieldSuffix, setContributionFieldSuffix] = useState('');

  const { pensionSchemes } = useEmployerPensionSchemes();
  const { contributionGroups } = useContributionGroups(selectedScheme);

  const { mutateAsync } = useWrapMutation(
    useCreateEmployeePension,
    createEmployeePensionAPI,
  );
  const queryClient = useQueryClient();
  const form = useForm<FormData>({
    defaultValues: {
      pensionContributionGroupId: undefined,
      effectiveDate: dateFormatter.format(effectiveDate),
    },
  });

  if (!activeEmployeeId) {
    navigateToListing();
    return <></>;
  }

  const handleContributionTypeChange = (value: string) =>
    setContributionFieldSuffix(value === 'PERCENTAGE' ? '%' : '£');

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [createEmployeePensionAPI.KEY],
    });
    navigateToEmployee(activeEmployeeId);
  };

  const handleSubmit = ({ contributionType, ...rawRequestBody }: FormData) => {
    const employeeId = Number(activeEmployeeId);
    if (Number.isNaN(employeeId)) return;

    const requestBody = rawRequestBody;
    if (contributionType) {
      requestBody.employerContributionOverride?.contributionType =
        contributionType;
    }

    mutateAsync({
      requestPathParams: { employeeId },
      requestBody,
    })
      .then(handleSuccess)
      .catch(handleError);
  };

  return (
    <FormProvider {...form}>
      {/* TODO: contribute to DS and remove the hack */}
      <style>
        {`[class^=react-datepicker] { pointer-events: all !important; }`}
      </style>
      <Dialog.Util title="Allocate new contribution group" open={isInAllocate}>
        <Dialog.Content>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Select onValueChange={setSelectedScheme}>
              <Select.TriggerValue placeholder="Select a pension scheme" />
              <Select.Viewport>
                {pensionSchemes?.data.map((pensionScheme) => (
                  <Select.Item key={pensionScheme.id} value={pensionScheme.id}>
                    {pensionScheme.providerName}
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select>
            <ControlledSelect<FormData>
              name="pensionContributionGroupId"
              disabled={!contributionGroups?.data.length}
            >
              <Select.TriggerValue placeholder="Select a contribution group" />
              <Select.Viewport>
                {contributionGroups?.data.map((contributionGroup) => (
                  <Select.Item
                    key={contributionGroup.id}
                    value={contributionGroup.id}
                  >
                    {contributionGroup.groupName}
                  </Select.Item>
                ))}
              </Select.Viewport>
            </ControlledSelect>
            <FormField.DateInput
              title="Effective Date"
              date={effectiveDate}
              onChange={({ date }) => {
                setEffectiveDate(date ? (date as Date) : new Date());
                form.setValue(
                  'effectiveDate',
                  dateFormatter.format(date as Date),
                );
              }}
            />
            <FormField.DateInput
              title="End Date"
              placeholder="If applicable"
              date={endDate}
              onChange={({ date }) => {
                setEndDate(date as Date);
                date
                  ? form.setValue('endDate', dateFormatter.format(date as Date))
                  : form.setValue('endDate', undefined);
              }}
            />
            <FormField.Checkbox
              title="Override contribution"
              checked={overrideContribution}
              onCheckedChange={(checked) => {
                setOverrideContribution(checked as boolean);
                if (!checked) {
                  form.unregister('contributionType');
                  form.unregister('employerContributionOverride');
                  form.unregister('employeeContributionOverride');
                }
              }}
            />
            {overrideContribution && (
              <>
                <ControlledSelect<FormData>
                  name="contributionType"
                  onValueChange={handleContributionTypeChange}
                >
                  <Select.TriggerValue placeholder="Select a contribution type" />
                  <Select.Viewport>
                    <Select.Item value="AMOUNT">Amount</Select.Item>
                    <Select.Item value="PERCENTAGE">Percentage</Select.Item>
                  </Select.Viewport>
                </ControlledSelect>
                <FormField.Input
                  title="Employer contribution"
                  type="number"
                  suffix={contributionFieldSuffix}
                  {...form.register(
                    'employerContributionOverride.contribution',
                  )}
                />
                <FormField.Input
                  title="Employee contribution"
                  type="number"
                  suffix={contributionFieldSuffix}
                  {...form.register(
                    'employeeContributionOverride.contribution',
                  )}
                />
              </>
            )}
          </form>
        </Dialog.Content>
        <Dialog.Footer>
          <ActionBar>
            <Actions.Secondary
              variant="ghost"
              onClick={() => navigateToEmployee(activeEmployeeId)}
            >
              Cancel
            </Actions.Secondary>
            <Actions.Primary onClick={() => form.handleSubmit(handleSubmit)()}>
              Approve
            </Actions.Primary>
          </ActionBar>
        </Dialog.Footer>
      </Dialog.Util>
    </FormProvider>
  );
};
