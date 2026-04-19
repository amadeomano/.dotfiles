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
import { Icon, icons } from 'designSystem/component/icon';
import { useContributionGroups } from './useContributionGroups';
import { CreateContributionGroup } from './CreateContributionGroup';
import { useContributionGroupNavigation } from './useContributionGroupsNavigation';

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
            Create New Pension Scheme
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
                  <PropertyListItemValue.Text
                    value={
                      contributionGroup.employerContribution.contribution +
                      (contributionGroup.employerContribution
                        .contributionType === 'AMOUNT'
                        ? '£'
                        : '%')
                    }
                  />
                </PropertyListItem>
                <PropertyListItem>
                  <PropertyListItemLabel>
                    Employee contribution
                  </PropertyListItemLabel>
                  <PropertyListItemValue.Text
                    value={
                      contributionGroup.employeeContribution.contribution +
                      (contributionGroup.employeeContribution
                        .contributionType === 'AMOUNT'
                        ? '£'
                        : '%')
                    }
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
