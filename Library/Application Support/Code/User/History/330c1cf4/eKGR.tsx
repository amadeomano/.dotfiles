import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { type Employee } from '../../../../hooks/usePeopleData';

type Cell = ColumnConfig<Employee, unknown>['cell'];
export const PersonCell: Cell = ({ value, row }) => {
  console.log('[]', 'rendering PersonCell');
  return (
    <TableCell.Token
      avatar={{
        name: row.person?.name,
        src: row.person?.avatar,
      }}
      value={row.person?.name}
      renderHoverCard={({ children }) => (
        <SmartHoverCard.Person id={value as string}>
          {children}
        </SmartHoverCard.Person>
      )}
    />
  );
};
