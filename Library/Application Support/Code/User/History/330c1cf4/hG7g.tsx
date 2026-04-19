import { useMemo } from 'react';
import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { type Employee } from '../../../../hooks/usePeopleData';

type Cell = ColumnConfig<Employee, unknown>['cell'];
export const PersonCell: Cell = ({ value, row }) => {
  const id = useMemo(() => row.person?.id, [row.person?.id]);
  const name = useMemo(() => row.person?.name, [row.person?.name]);
  const avatar = useMemo(() => row.person?.avatar, [row.person?.avatar]);

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
