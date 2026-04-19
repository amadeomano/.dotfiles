import { usePayrollRunNavigation } from '../usePayrollRunNavigation';
import { useEmployeePensions } from './useEmployeePensions';
import { Button } from 'designSystem/component/button';
import { Accordion } from 'designSystem/component/accordion';
import { AllocateContributionGroup } from './AllocateContributionGroup';
import { AllocationItem } from './AllocationItem';
import { ListEmployeePensionsData } from 'payroll/data/payroll-me';

type ListPensionSchemasProps = {
  employeeId?: string;
};

type AllocationItem = ListEmployeePensionsData['data'];
const sortByDate = (a: AllocationItem, b: AllocationItem) =

export const ListEmployeePensions = ({
  employeeId,
}: ListPensionSchemasProps) => {
  const { navigateToAllocate } = usePayrollRunNavigation();
  const { employeePensions } = useEmployeePensions(employeeId);
  return (
    <>
      <Button onClick={navigateToAllocate}>
        Allocate new contribution group
      </Button>
      <Accordion type="multiple">
        {employeePensions?.data
          .sort((a, b) =>
            a.pensionContributionGroup.groupName.localeCompare(
              b.pensionContributionGroup.groupName,
            ),
          )
          .map((pension) => (
            <Accordion.Item key={pension.id} value={pension.id}>
              <Accordion.Trigger>
                {pension.pensionContributionGroup.groupName}
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
