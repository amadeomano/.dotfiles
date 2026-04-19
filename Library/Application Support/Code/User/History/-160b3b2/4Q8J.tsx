import { useRouter } from 'next/router';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
  ListHeader,
  ListHeaderTitle,
  ListHeaderAccessories,
} from 'designSystem/component/list';
import { icons } from 'designSystem/component/icon';
import { IconButton } from 'designSystem/component/button';
import { useEmployerPensionSchemes } from '../../../data/useEmployerPensionSchemes';
import { CreatePensionScheme } from './CreatePensionScheme';
import { useNavigateToCreatePensionScheme } from './useNavigateToCreatePensionScheme';

export const ListPensionSchemas = () => {
  const router = useRouter();
  const { pensionSchemes } = useEmployerPensionSchemes();
  const isCreate = router.query.slug?.includes('create');
  return (
    <>
      <ListHeader>
        <ListHeaderTitle />
        <ListHeaderAccessories>
          <ListHeaderAccessories.Button>
            Create New Pension Scheme
          </ListHeaderAccessories.Button>
        </ListHeaderAccessories>
      </ListHeader>
      <List>
        {pensionSchemes?.data.map((scheme) => (
          <ListItem>
            <ListItemText
              meta={`${scheme.providerReference}: ${scheme.providerType}`}
            >
              {scheme.providerName}
            </ListItemText>
            <ListItemAccessories>
              <IconButton
                variant="ghost"
                aria-label="manage groups"
                icon={icons.chevronRight}
              />
            </ListItemAccessories>
          </ListItem>
        ))}
      </List>
      {isCreate ? <CreatePensionScheme /> : null}
    </>
  );
};
