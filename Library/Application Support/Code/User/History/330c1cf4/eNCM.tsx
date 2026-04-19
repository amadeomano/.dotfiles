import { ApolloProvider } from '@apollo/client';
import { useAuthContext } from '@personio-web/auth-context';
import {
  goferClient as designSystemGoferClient,
  useGetPersonBaseDataQuery,
} from 'designSystem/data/gofer';
import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { type Employee } from '../../../../hooks/usePeopleData';

type Cell = ColumnConfig<Employee, unknown>['cell'];
export const PersonCell: Cell = ({ value }) => {
  const employeeId = (value as number).toString();

  return (
    <TableCell.Token
      avatar={{ name: (value as number).toString() }}
      value={(value as number).toString()}
      renderHoverCard={({ children }) => (
        <SmartHoverCard.Person id={(value as number).toString()}>
          {children}
        </SmartHoverCard.Person>
      )}
    />
  );
};
