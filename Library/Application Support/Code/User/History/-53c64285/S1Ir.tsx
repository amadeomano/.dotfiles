import { Stack } from 'designSystem/component/layout';
import { List } from 'designSystem/component/list';

export const EmployeeTabContents = () => (
  <Stack>
    <h4>Gross Pay</h4>
    <List {...args}>
      <ListItem onClick={formatStorybookCallbacks(action('onClick'))}>
        <ListItemText meta="Description 1">Title 1</ListItemText>
      </ListItem>
      <ListItem onClick={formatStorybookCallbacks(action('onClick'))}>
        <ListItemText meta="Description 2">Title 2</ListItemText>
      </ListItem>
      <ListItem onClick={formatStorybookCallbacks(action('onClick'))}>
        <ListItemText meta="Description 3">Title 3</ListItemText>
      </ListItem>
    </List>
  </Stack>
);
