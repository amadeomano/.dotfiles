import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { type Employee } from '../../../../hooks/usePeopleData';
import {
  type PersonColumnData,
  getPerson,
} from '../../../../hooks/usePersonColumnData';

type Cell = ColumnConfig<Employee, unknown>['cell'];
export const PersonCell: Cell = ({ value }) => {
  const employeeId = (value as number).toString();
  const person = getPerson(personData, employeeId);

  return (
    <TableCell.Token
      avatar={{
        name: person?.name,
        src: person?.avatar,
      }}
      value={person?.name}
      renderHoverCard={({ children }) => (
        <SmartHoverCard.Person id={employeeId}>
          {children}
        </SmartHoverCard.Person>
      )}
    />
  );
};
