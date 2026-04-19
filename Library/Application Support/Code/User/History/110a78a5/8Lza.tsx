import { FC } from 'react';
import {
  ListHeader,
  ListHeaderTitle,
  ListHeaderAccessories,
} from 'designSystem/component/list';
import {
  PropertyList,
  PropertyListItem,
  PropertyListItemLabel,
  PropertyListItemValue,
} from 'designSystem/component/property-list';
import { Accordion } from 'designSystem/component/accordion';
import { useContributionGroups } from './useContributionGroups';
import { CreateContributionGroup } from './CreateContributionGroup';
import { useContributionGroupNavigation } from './useContributionGroupsNavigation';

const getNumericValue = (value: string) =>
  isNaN(Number(value)) ? 0 : Number(value);

export const ListContributionGroups = () => {
  const { getActiveSchemeId, navigateToCreate, isInCreateRoute } =
    useContributionGroupNavigation();
  const { contributionGroups } = useContributionGroups(getActiveSchemeId());
  return (
    <div>
      <ListHeader>
        <ListHeaderTitle />
        <ListHeaderAccessories>
          <ListHeaderAccessories.Button onClick={navigateToCreate}>
            Create New Contribution Group
          </ListHeaderAccessories.Button>
        </ListHeaderAccessories>
      </ListHeader>
      <Accordion type="multiple">
        {contributionGroups?.data.map((contributionGroup) => (
          <Accordion.Item value={contributionGroup.id}>
            <Accordion.Trigger>{contributionGroup.groupName}</Accordion.Trigger>
            <Accordion.Content>
              <PropertyList>
                <PropertyListItem>
                  <PropertyListItemLabel>Earning type</PropertyListItemLabel>
                  <PropertyListItemValue.Enum
                    value={contributionGroup.earningsType.toString()}
                  />
                </PropertyListItem>
                <PropertyListItem>
                  <PropertyListItemLabel>
                    Employer contribution
                  </PropertyListItemLabel>
                  {contributionGroup.employerContribution.contributionType ===
                  'PERCENTAGE' ? (
                    <PropertyListItemValue.Percent
                      value={getNumericValue(
                        contributionGroup.employerContribution.contribution,
                      )}
                    />
                  ) : (
                    <PropertyListItemValue.Currency
                      value={getNumericValue(
                        contributionGroup.employerContribution.contribution,
                      )}
                      locale="en-GB"
                      currency="GBP"
                    />
                  )}
                </PropertyListItem>
                <PropertyListItem>
                  <PropertyListItemLabel>
                    Employee contribution
                  </PropertyListItemLabel>
                  {contributionGroup.employeeContribution.contributionType ===
                  'PERCENTAGE' ? (
                    <PropertyListItemValue.Percent
                      value={getNumericValue(
                        contributionGroup.employeeContribution.contribution,
                      )}
                    />
                  ) : (
                    <PropertyListItemValue.Currency
                      value={getNumericValue(
                        contributionGroup.employeeContribution.contribution,
                      )}
                      locale="en-GB"
                      currency="GBP"
                    />
                  )}
                </PropertyListItem>
                <PropertyListItem>
                  <PropertyListItemLabel>Taxation method</PropertyListItemLabel>
                  <PropertyListItemValue.Enum
                    value={contributionGroup.taxationMethod.toString()}
                  />
                </PropertyListItem>
              </PropertyList>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
      {isInCreateRoute ? <CreateContributionGroup /> : null}
    </div>
  );
};
