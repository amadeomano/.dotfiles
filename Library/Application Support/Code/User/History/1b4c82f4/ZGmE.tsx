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

type ListPensionSchemasProps = {
  employeeId?: string;
};

const getNumericValue = (value: string) =>
  isNaN(Number(value)) ? 0 : Number(value);

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
              <PropertyList>
                <PropertyListHeader>
                  <PropertyListHeaderTitle />
                  <PropertyListHeaderAccessories>
                    <Button>Edit</Button>
                  </PropertyListHeaderAccessories>
                </PropertyListHeader>
                <PropertyListItem>
                  <PropertyListItemLabel>Effective Date</PropertyListItemLabel>
                  <PropertyListItemValue.Date
                    locale="en-GB"
                    value={new Date(pension.effectiveDate)}
                  />
                </PropertyListItem>
                <PropertyListItem>
                  <PropertyListItemLabel>End Date</PropertyListItemLabel>
                  {pension.endDate ? (
                    <PropertyListItemValue.Date
                      locale="en-GB"
                      value={new Date(pension.endDate)}
                    />
                  ) : null}
                </PropertyListItem>
                {pension.employerContributionOverride ? (
                  <PropertyListItem>
                    <PropertyListItemLabel>
                      Employer Contribution Override
                    </PropertyListItemLabel>
                    {pension.employerContributionOverride.contributionType ===
                    'PERCENTAGE' ? (
                      <PropertyListItemValue.Percent
                        value={getNumericValue(
                          pension.employerContributionOverride.contribution,
                        )}
                      />
                    ) : (
                      <PropertyListItemValue.Currency
                        value={getNumericValue(
                          pension.employerContributionOverride.contribution,
                        )}
                        locale="en-GB"
                        currency="GBP"
                      />
                    )}
                  </PropertyListItem>
                ) : null}
                {pension.employeeContributionOverride ? (
                  <PropertyListItem>
                    <PropertyListItemLabel>
                      Employee Contribution Override
                    </PropertyListItemLabel>
                    {pension.employeeContributionOverride.contributionType ===
                    'PERCENTAGE' ? (
                      <PropertyListItemValue.Percent
                        value={getNumericValue(
                          pension.employeeContributionOverride.contribution,
                        )}
                        onEdit={() => console.log}
                      />
                    ) : (
                      <PropertyListItemValue.Currency
                        value={getNumericValue(
                          pension.employeeContributionOverride.contribution,
                        )}
                        locale="en-GB"
                        currency="GBP"
                        onEdit={() => console.log}
                      />
                    )}
                  </PropertyListItem>
                ) : null}
              </PropertyList>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
      <AllocateContributionGroup />
    </>
  );
};
