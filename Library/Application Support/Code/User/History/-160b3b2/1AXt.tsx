import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
  ListHeader,
  ListHeaderTitle,
  ListHeaderAccessories,
} from 'designSystem/component/list';
import { Inline, Stack } from 'designSystem/component/layout';
import { Icon, icons } from 'designSystem/component/icon';
import { useEmployerPensionSchemes } from '../../../data/useEmployerPensionSchemes';
import { CreatePensionScheme } from './CreatePensionScheme';
import { usePensionSchemeNavigation } from './usePensionSchemeNavigation';
import { ListSchemeContributionGroups } from '../PensionSchemeContributionGroupsSettings/ListSchemeContributionGroups';

export const ListPensionSchemas = () => {
  const {
    navigateToCreate,
    isInCreateRoute,
    navigateToContributionGroupsList,
    isInContributionGroupsListRoute,
    isSchemaActive,
  } = usePensionSchemeNavigation();
  const { pensionSchemes } = useEmployerPensionSchemes();
  return (
    <Inline>
      <ListHeader>
        <ListHeaderTitle />
        <ListHeaderAccessories>
          <ListHeaderAccessories.Button onClick={navigateToCreate}>
            Create New Pension Scheme
          </ListHeaderAccessories.Button>
        </ListHeaderAccessories>
      </ListHeader>
      <List>
        {pensionSchemes?.data.map((scheme) => (
          <ListItem
            onClick={() => navigateToContributionGroupsList(scheme.id)}
            active={isSchemaActive(scheme.id)}
          >
            <ListItemText
              meta={`${scheme.providerReference}: ${scheme.providerType}`}
            >
              {scheme.providerName}
            </ListItemText>
            <ListItemAccessories>
              <Icon icon={icons.chevronRight} />
            </ListItemAccessories>
          </ListItem>
        ))}
      </List>
      {isInCreateRoute ? <CreatePensionScheme /> : null}
      {isInContributionGroupsListRoute ? (
        <ListSchemeContributionGroups />
      ) : null}
    </Inline>
  );
};
