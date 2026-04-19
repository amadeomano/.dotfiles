import { useState } from 'react';
import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Stack, Inline } from 'designSystem/component/layout';
import { Dialog } from 'designSystem/component/dialog';
import { type FacepileProps, Facepile } from 'designSystem/component/facepile';
import {
  type SelectionTileOption,
  SelectionTileGroup,
} from 'designSystem/component/selection-tile-group';
import { usePersonColumnData } from '../../../../hooks/usePersonColumnData';
import { PayGroup } from './PayGroup';
import styles from './styles.module.scss';
import { useAssignablePayGroups, getGroupById } from './useAssignablePayGroups';

type Face = FacepileProps['items'][number];
type AssignPayrollGroupDialogProps = {
  employeeIds: string[];
  onClose: () => void;
};
export const AssignPayrollGroupDialog = ({
  employeeIds,
  onClose,
}: AssignPayrollGroupDialogProps) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined,
  );
  const assignableGroups = useAssignablePayGroups();
  const options: SelectionTileOption[] = assignableGroups.map((group) => ({
    id: group.id.toString(),
    value: group.id.toString(),
    label: group.name,
    customRenderer: () => (
      <PayGroup
        name={group.name}
        employeeCount={group.employeeCount}
        faces={group.faces}
      />
    ),
  }));

  const { persons } = usePersonColumnData(employeeIds.slice(0, 4));
  const faces: Face[] = persons.map<Face>((person) => ({
    id: person.id,
    name: person.name,
    src: person.avatar,
  }));

  const selectedGroup = getGroupById(assignableGroups, selectedGroupId);

  return (
    <Dialog.Util title="Assign group" open size="medium">
      <Dialog.Content>
        <Stack space="section-xsmall">
          <Inline space="gap-default">
            <Facepile items={faces} totalItems={employeeIds.length} />
            <p>You are about to assign {employeeIds.length} employees to</p>
          </Inline>
          <article className={styles.surface}>
            <SelectionTileGroup
              showControls={false}
              options={options}
              value={selectedGroupId}
              onValueChange={(values) => setSelectedGroupId(values[0].id)}
            />
            {selectedGroup && (
              <div className={styles.tip}>
                <Stack space="gap-xsmall">
                  <p>What happens next</p>
                  <p className={styles.tipDescription}>
                    Change will take effect in the next payroll run, their next
                    pay day will be {selectedGroup.nextPayDate}
                  </p>
                </Stack>
              </div>
            )}
          </article>
        </Stack>
      </Dialog.Content>
      <Dialog.Footer>
        <ActionBar>
          <Actions.Secondary variant="default" onClick={onClose}>
            Cancel
          </Actions.Secondary>
          <Actions.Primary
            onClick={() => {
              console.log('confirm');
              onClose();
            }}
            type="submit"
          >
            Confirm
          </Actions.Primary>
        </ActionBar>
      </Dialog.Footer>
    </Dialog.Util>
  );
};
