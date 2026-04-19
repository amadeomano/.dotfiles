import { Stack } from 'designSystem/component/layout';
import { IconButton } from 'designSystem/component/button';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAccessories,
} from 'designSystem/component/list';

export const EmployeeTabContents = () => (
  <Stack>
    <h4>Gross Pay</h4>
    <List variant="ghost">
      <ListItem onClick={console.log}>
        <ListItemText meta="Description 1">Title 1</ListItemText>
        <ListItemAccessories>
          <IconButton
            size="small"
            variant="ghost"
            aria-label="Chevron right"
            icon={icons.chevronRight}
          />
        </ListItemAccessories>
      </ListItem>
      <ListItem>
        <ListItemText meta="Description 2">Title 2</ListItemText>
      </ListItem>
      <ListItem>
        <ListItemText meta="Description 3">Title 3</ListItemText>
      </ListItem>
    </List>
  </Stack>
);
