import type { MouseEvent } from 'react';
import type { AxiosError } from '@personio/request';
import { usePayrollRunNavigation } from '../usePayrollRunNavigation';
import { useEmployeePensions } from './useEmployeePensions';
import { icons } from 'designSystem/component/icon';
import { Button, IconButton } from 'designSystem/component/button';
import { Accordion } from 'designSystem/component/accordion';
import { toaster } from 'designSystem/component/toaster';
import { AllocateContributionGroup } from './AllocateContributionGroup';
import { AllocationItem } from './AllocationItem';
import type { ListEmployeePensionsData } from 'payroll/data/payroll-me';
import { useDeleteEmployeePension } from '@personio-web/payroll-data-payroll-me';
import {
  deleteEmployeePensionAPI,
  listEmployeePensionsAPI,
} from '@personio-web/payroll-data-payroll-me/src/common';

type ListPensionSchemasProps = {
  employeeId?: string;
};

type AllocationItem = ListEmployeePensionsData['data'][number];
const sortByDate = (a: AllocationItem, b: AllocationItem) =>
  a.effectiveDate.localeCompare(b.effectiveDate);

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

export const ListEmployeePensions = ({
  employeeId,
}: ListPensionSchemasProps) => {
  const { navigateToAllocate } = usePayrollRunNavigation();
  const { employeePensions } = useEmployeePensions(employeeId);
  const { mutateAsync: deleteAllocation } = useDeleteEmployeePension();

  const handleRemoveClick = (event: MouseEvent) => {
    event.stopPropagation();
    deleteAllocation({ requestPathParams: {} });
  };

  return (
    <>
      <Button onClick={navigateToAllocate}>
        Allocate new contribution group
      </Button>
      <Accordion type="multiple">
        {employeePensions?.data.sort(sortByDate).map((pension) => (
          <Accordion.Item key={pension.id} value={pension.id}>
            <Accordion.Trigger>
              {pension.pensionContributionGroup.groupName}
              <IconButton
                size="small"
                style={{ marginLeft: 'auto' }}
                icon={icons.trash}
                aria-label="Remove contribution"
                onClick={handleRemoveClick}
              />
            </Accordion.Trigger>
            <Accordion.Content>
              <AllocationItem pension={pension} />
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
      <AllocateContributionGroup />
    </>
  );
};
