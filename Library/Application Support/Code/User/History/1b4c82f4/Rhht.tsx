import { usePayrollRunNavigation } from '../usePayrollRunNavigation';
import { useEmployeePensions } from './useEmployeePensions';
import { Button } from 'designSystem/component/button';
import { Accordion } from 'designSystem/component/accordion';
import { AllocateContributionGroup } from './AllocateContributionGroup';
import { AllocationItem } from './AllocationItem';
import { ListEmployeePensionsData } from 'payroll/data/payroll-me';
import { a } from 'msw/lib/glossary-de6278a9';

type ListPensionSchemasProps = {
  employeeId?: string;
};

type AllocationItem = ListEmployeePensionsData['data'];
const sortByDate = (a: AllocationItem, b: AllocationItem) =>
  a.effectiveDate.localeCompare(b.effectiveDate);

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
        {employeePensions?.data.sort(sortByDate).map((pension) => (
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
