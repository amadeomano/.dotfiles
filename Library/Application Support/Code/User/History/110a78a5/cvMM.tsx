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
import type { CreatePensionContributionGroupBody } from 'payroll/data/payroll-me';

type Contribution =
  | CreatePensionContributionGroupBody['employerContribution']
  | CreatePensionContributionGroupBody['employeeContribution'];
const ContributionValue = ({ contribution: Contribution }) => {
  const value = isNaN(Number(contribution.contribution))
    ? 0
    : Number(contribution.contribution);

  return contribution.contributionType === 'PERCENTAGE' ? (
    <PropertyListItemValue.Percent value={value} />
  ) : (
    <PropertyListItemValue.Currency
      value={value}
      locale="en-GB"
      currency="GBP"
    />
  );
};

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
                  <ContributionValue
                    contribution={contributionGroup.employerContribution}
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
