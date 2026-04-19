import type { FC } from 'react';
import type { AxiosError } from '@personio/request';
import { useQueryClient } from 'react-query';
import { FormProvider, useForm } from 'react-hook-form';
import { Button } from 'designSystem/component/button';
import { toaster } from 'designSystem/component/toaster';
import {
  PropertyList,
  PropertyListHeader,
  PropertyListHeaderTitle,
  PropertyListHeaderAccessories,
  PropertyListItem,
  PropertyListItemLabel,
  PropertyListItemValue,
  PropertyListItemAccessory,
} from 'designSystem/component/property-list';
import type { GetEmployeePensionData } from '@personio-web/payroll-data-payroll-me-types';
import { useUpdateEmployeePension } from '@personio-web/payroll-data-payroll-me';
import {
  updateEmployeePensionAPI,
  listEmployeePensionsAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';
import { type UpdateEmployeePensionBody } from 'payroll/data/payroll-me';
import { usePayrollRunNavigation } from '../usePayrollRunNavigation';
import { useWrapMutation } from '../../../hooks/temporary/useWrapQuery';

type AllocateItemProps = { pension: GetEmployeePensionData };
type Override = UpdateEmployeePensionBody['employeeContributionOverride'];
type FormData = UpdateEmployeePensionBody & {
  overrideContribution: boolean;
  contributionType?: NonNullable<Override>['contributionType'];
  employeeContribution?: NonNullable<Override>['contribution'];
  employerContribution?: NonNullable<Override>['contribution'];
};

const formatDate = (date: Date) => date.toISOString().split('T')[0];
const getNumericValue = (value: string) =>
  isNaN(Number(value)) ? 0 : Number(value);

type ServerError = { detail?: string; errors?: { title: string }[] };
const handleError = (error: AxiosError<ServerError>) => {
  toaster.notify({
    variant: 'error',
    title: 'Contribution Group Creation Error',
    description:
      error.response?.data.errors?.[0].title ??
      error.response?.data.detail ??
      String(error),
    showCloseButton: true,
  });
};

export const AllocationItem: FC<AllocateItemProps> = ({ pension }) => {
  const form = useForm<FormData>({
    defaultValues: {
      effectiveDate: pension.effectiveDate,
      endDate: pension.endDate,
      overrideContribution: Boolean(pension.employeeContributionOverride),
      contributionType: pension.employeeContributionOverride?.contributionType,
      employeeContribution: pension.employeeContributionOverride?.contribution,
      employerContribution: pension.employerContributionOverride?.contribution,
    },
  });
  const effectiveDate = form.watch('effectiveDate');
  const endDate = form.watch('endDate');
  const overrideContribution = form.watch('overrideContribution');
  const contributionType = form.watch('contributionType');
  const employeeContribution = form.watch('employeeContribution');
  const employerContribution = form.watch('employerContribution');

  // Due to resetField's requirement for registering fields
  if (overrideContribution) {
    form.register('contributionType');
    form.register('employeeContribution');
    form.register('employerContribution');
  }

  const { activeEmployeeId } = usePayrollRunNavigation();
  const queryClient = useQueryClient();
  const { mutateAsync, isLoading } = useWrapMutation(
    useUpdateEmployeePension,
    updateEmployeePensionAPI,
  );

  const handleSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [listEmployeePensionsAPI.KEY],
    });
    form.reset(form.getValues());
  };

  const handleSubmit = ({
    overrideContribution,
    contributionType,
    employeeContribution,
    employerContribution,
    ...formData
  }: FormData) => {
    const employeeId = Number(activeEmployeeId);
    if (Number.isNaN(employeeId)) return;

    const requestBody = formData;
    if (overrideContribution && contributionType) {
      if (employeeContribution)
        requestBody.employeeContributionOverride = {
          contributionType,
          contribution: employeeContribution,
        };
      if (employerContribution)
        requestBody.employerContributionOverride = {
          contributionType,
          contribution: employerContribution,
        };
    }
    mutateAsync({
      requestPathParams: { employeeId, id: pension.id },
      requestBody,
    })
      .then(handleSuccess)
      .catch(handleError);
  };
  const handleCancel = () => form.reset();

  return (
    <FormProvider {...form}>
      <PropertyList>
        {form.formState.isDirty ? (
          <PropertyListHeader>
            <PropertyListHeaderTitle />
            <PropertyListHeaderAccessories>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button
                onClick={() => form.handleSubmit(handleSubmit)()}
                variant="emphasisAccent"
                loading={isLoading}
              >
                Submit edit
              </Button>
            </PropertyListHeaderAccessories>
          </PropertyListHeader>
        ) : null}
        <PropertyListItem>
          <PropertyListItemLabel>Effective Date</PropertyListItemLabel>
          <PropertyListItemValue.Date
            locale="en-GB"
            value={new Date(effectiveDate)}
            onEdit={({ date }) => {
              form.setValue('effectiveDate', formatDate(date as Date), {
                shouldDirty: true,
              });
            }}
          />
        </PropertyListItem>
        <PropertyListItem>
          <PropertyListItemLabel>End Date</PropertyListItemLabel>
          {endDate ? (
            <PropertyListItemValue.Date
              locale="en-GB"
              value={new Date(endDate)}
              onEdit={({ date }) => {
                form.setValue('endDate', formatDate(date as Date), {
                  shouldDirty: true,
                });
              }}
            />
          ) : (
            <PropertyListItemValue.Custom
              value={
                <Button
                  children="Set date"
                  size="small"
                  onClick={() => {
                    form.setValue('endDate', formatDate(new Date()), {
                      shouldDirty: true,
                    });
                  }}
                />
              }
            />
          )}
          <PropertyListItemAccessory
            icon="arrowUndo"
            tooltipContent="Remove end date"
            onUndo={() => {
              form.setValue('endDate', undefined, { shouldDirty: true });
            }}
          />
        </PropertyListItem>
        <PropertyListItem>
          <PropertyListItemLabel>Override</PropertyListItemLabel>
          <PropertyListItemValue.Switch
            label="Employee Contribution Override"
            value={Boolean(overrideContribution)}
            onEdit={(state) => {
              form.setValue('overrideContribution', state, {
                shouldDirty: true,
              });
              form.resetField('contributionType');
              form.resetField('employeeContribution');
              form.resetField('employerContribution');
            }}
          />
        </PropertyListItem>
        {overrideContribution ? (
          <PropertyListItem>
            <PropertyListItemLabel>
              Contribution type Override
            </PropertyListItemLabel>
            <PropertyListItemValue.Enum
              value={contributionType ?? ''}
              editorProps={{
                selected: contributionType ?? '',
                options: [
                  { label: 'Percentage', value: 'PERCENTAGE' },
                  { label: 'Amount', value: 'AMOUNT' },
                ],
              }}
              onEdit={(value) => {
                form.setValue(
                  'contributionType',
                  value as 'PERCENTAGE' | 'AMOUNT',
                  { shouldDirty: true },
                );
              }}
            />
          </PropertyListItem>
        ) : null}
        {overrideContribution ? (
          <PropertyListItem>
            <PropertyListItemLabel>
              Employer Contribution Override
            </PropertyListItemLabel>
            {contributionType === 'PERCENTAGE' ? (
              <PropertyListItemValue.Percent
                value={getNumericValue(employerContribution ?? '')}
                onEdit={(value) =>
                  form.setValue('employerContribution', value.toFixed(2), {
                    shouldDirty: true,
                  })
                }
              />
            ) : (
              <PropertyListItemValue.Currency
                value={getNumericValue(employerContribution ?? '')}
                onEdit={(value) =>
                  form.setValue('employerContribution', value.toFixed(2), {
                    shouldDirty: true,
                  })
                }
                locale="en-GB"
                currency="GBP"
              />
            )}
          </PropertyListItem>
        ) : null}
        {overrideContribution ? (
          <PropertyListItem>
            <PropertyListItemLabel>
              Employee Contribution Override
            </PropertyListItemLabel>
            {contributionType === 'PERCENTAGE' ? (
              <PropertyListItemValue.Percent
                value={getNumericValue(employeeContribution ?? '')}
                onEdit={(value) =>
                  form.setValue('employeeContribution', value.toFixed(2), {
                    shouldDirty: true,
                  })
                }
              />
            ) : (
              <PropertyListItemValue.Currency
                value={getNumericValue(employeeContribution ?? '')}
                locale="en-GB"
                currency="GBP"
                onEdit={(value) =>
                  form.setValue('employeeContribution', value.toFixed(2), {
                    shouldDirty: true,
                  })
                }
              />
            )}
          </PropertyListItem>
        ) : null}
      </PropertyList>
    </FormProvider>
  );
};
