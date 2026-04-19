import { useAuthContext } from '@personio-web/auth-context';
import {
  goferClient as designSystemGoferClient,
  useGetPersonBaseDataQuery,
} from 'designSystem/data/gofer';
import { TableCell, type ColumnConfig } from 'designSystem/component/table';
import { SmartHoverCard } from 'designSystem/feature/smart-hover-card';
import { type Employee } from '../../../../hooks/usePeopleData';
import { type PersonColumnData } from '../../hooks/usePersonColumnData';

type Cell = ColumnConfig<Employee, unknown>['cell'];
export const PersonCell =
  (): Cell =>
  ({ value }) => {
    const employeeId = (value as number).toString();

    // const authContext = useAuthContext();
    // const { data: personData } = useGetPersonBaseDataQuery({
    //   variables: {
    //     personId: employeeId,
    //     companyId: authContext.companyId,
    //   },
    //   client: designSystemGoferClient,
    // });

    // const person =
    //   personData?.personandemployment_EmploymentService_GetEmployment_v1
    //     ?.employment.person;

    return (
      <TableCell.Token
        avatar={{
          name: `${employeeId}`,
          // src: person?.profilePicUrls?.paths?.small ?? undefined,
        }}
        value={`${employeeId}`}
        renderHoverCard={({ children }) => (
          <SmartHoverCard.Person id={employeeId}>
            {children}
          </SmartHoverCard.Person>
        )}
      />
    );
  };
