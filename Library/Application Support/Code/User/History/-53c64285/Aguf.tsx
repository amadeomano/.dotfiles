import { Stack } from 'designSystem/component/layout';
import { List, ListItem, ListItemText } from 'designSystem/component/list';

export const EmployeeTabContents = () => (
  <Stack>
    <h4>Gross Pay</h4>
    <List variant="ghost">
      <ListItem>
        <ListItemText meta="Description 1">Title 1</ListItemText>
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
