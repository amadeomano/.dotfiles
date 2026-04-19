import { ActionBar, Actions } from 'designSystem/component/action-bar';
import { Stack, Inline } from 'designSystem/component/layout';
import { Dialog } from 'designSystem/component/dialog';
import { type FacepileProps, Facepile } from 'designSystem/component/facepile';
import {
  type SelectionTileOption,
  SelectionTileGroup,
} from 'designSystem/component/selection-tile-group';
import styles from './AssignPayrollGroupDialog.module.scss';
import { useAssignablePayGroups } from './useAssignablePayGroups';

type PayGroupProps = {
  name: string;
  employeeCount: number;
  faces: FacepileProps['items'];
};
const PayGroup = ({ name, employeeCount, faces }: PayGroupProps) => (
  <>
    <label>{name}</label>
    <Inline>
      <Facepile items={faces} totalItems={employeeCount} />
      <p>{employeeCount} People</p>
    </Inline>
  </>
);

type AssignPayrollGroupDialogProps = { onClose: () => void };
export const AssignPayrollGroupDialog = ({
  onClose,
}: AssignPayrollGroupDialogProps) => {
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

  return (
    <Dialog.Util title="Assign group" open size="medium">
      <Dialog.Content>
        <Stack space="section-medium">
          <Inline>
            <Facepile items={[]} />
            <p>You are about to assign 2 employees to</p>
          </Inline>
          <article className={styles.surface}>
            <SelectionTileGroup showControls={false} options={options} />
            <div className={styles.tip}>
              <Stack space="gap-xsmall">
                <p>What happens next</p>
                <p>
                  Change will take effect in the next payroll run, their next
                  pay day will be 14 December 2025
                </p>
              </Stack>
            </div>
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
