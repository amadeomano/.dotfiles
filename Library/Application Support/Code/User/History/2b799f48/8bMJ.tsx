import { Tabs } from 'designSystem/component/tabs';

export const TabBar = () => (
  <Tabs defaultValue="compensation">
    <Tabs.List>
      <Tabs.Trigger value="compensation">Compensation</Tabs.Trigger>
      <Tabs.Trigger disabled value="changes">
        Changes
      </Tabs.Trigger>
      <Tabs.Trigger disabled value="tasks">
        Tasks
      </Tabs.Trigger>
      <Tabs.Trigger disabled value="info">
        Info
      </Tabs.Trigger>
    </Tabs.List>
  </Tabs>
);
