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
import { IconButton } from 'designSystem/component/button';
import { useEmployerPensionSchemes } from '../../../data/useEmployerPensionSchemes';
import { CreatePensionScheme } from './CreatePensionScheme';
import { usePensionSchemeNavigation } from './usePensionSchemeNavigation';

export const ListPensionSchemas = () => {
  const {
    navigateToCreate,
    isInCreateRoute,
    navigateToContributionGroupsList,
    isSchemaActive,
  } = usePensionSchemeNavigation();
  const { pensionSchemes } = useEmployerPensionSchemes();
  return (
    <>
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
    </>
  );
};
