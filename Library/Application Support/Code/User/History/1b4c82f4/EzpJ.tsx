import { usePayrollRunNavigation } from '../usePayrollRunNavigation';
import { useEmployeePensions } from './useEmployeePensions';
import { Button } from 'designSystem/component/button';
import { Accordion } from 'designSystem/component/accordion';
import {
  PropertyList,
  PropertyListHeader,
  PropertyListHeaderTitle,
  PropertyListHeaderAccessories,
  PropertyListItem,
  PropertyListItemLabel,
  PropertyListItemValue,
} from 'designSystem/component/property-list';
import { AllocateContributionGroup } from './AllocateContributionGroup';
import { AllocationItem } from './AllocationItem';

type ListPensionSchemasProps = {
  employeeId?: string;
};

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
        {employeePensions?.data.map((pension) => (
          <Accordion.Item value={pension.id}>
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
