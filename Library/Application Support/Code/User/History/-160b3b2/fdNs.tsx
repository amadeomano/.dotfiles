import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
  ListHeader,
  ListHeaderTitle,
  ListHeaderAccessories,
} from 'designSystem/component/list';
import { Icon, icons } from 'designSystem/component/icon';
import { useEmployerPensionSchemes } from '../../../data/useEmployerPensionSchemes';
import { CreatePensionScheme } from './CreatePensionScheme';
import { usePensionSchemeNavigation } from './usePensionSchemeNavigation';
import { ListSchemeContributionGroups } from '../PensionSchemeContributionGroupsSettings/ListContributionGroups';

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
    <div
      style={{
        display: 'grid',
        gap: 20,
        gridTemplateColumns: isInContributionGroupsListRoute
          ? '30% 1fr'
          : '1fr',
      }}
    >
      <div>
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
      </div>
      {isInContributionGroupsListRoute ? (
        <ListSchemeContributionGroups />
      ) : null}
      {isInCreateRoute ? <CreatePensionScheme /> : null}
    </div>
  );
};
