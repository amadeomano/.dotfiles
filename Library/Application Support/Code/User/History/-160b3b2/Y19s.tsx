import { useRouter } from 'next/router';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
  ListHeader,
  ListHeaderAccessories,
} from 'designSystem/component/list';
import { icons } from 'designSystem/component/icon';
import { IconButton } from 'designSystem/component/button';
import { useEmployerPensionSchemes } from '../../../data/useEmployerPensionSchemes';
import { CreatePensionScheme } from './CreatePensionScheme';

export const ListPensionSchemas = () => {
  const router = useRouter();
  const { pensionSchemes } = useEmployerPensionSchemes();
  const isCreate = router.query.slug?.includes('create');
  return (
    <>
      <ListHeader>
        <ListHeaderAccessories>
          <ListHeaderAccessories.Button>New</ListHeaderAccessories.Button>
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
