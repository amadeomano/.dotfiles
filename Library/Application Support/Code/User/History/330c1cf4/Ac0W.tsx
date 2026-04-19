import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { type Employee } from '../../../../hooks/usePeopleData';
import {
  type PersonColumnData,
  getPerson,
} from '../../../../hooks/usePersonColumnData';

type Cell = ColumnConfig<Employee, unknown>['cell'];
export const PersonCell: Cell = ({ row }) => {
  return (
    <TableCell.Token
      avatar={{
        name: row.person?.name,
        src: row.person?.avatar,
      }}
      value={row.person?.name}
      renderHoverCard={({ children }) => (
        <SmartHoverCard.Person id={row.employeeId.toString()}>
          {children}
        </SmartHoverCard.Person>
      )}
    />
  );
};
