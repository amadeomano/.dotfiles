import { useMemo } from 'react';

import { HybridLink } from 'designSystem/component/link';
import { Icon, icons } from 'designSystem/component/icon';
import { buildPeopleListExtendedLink } from '@personio-web/employees-organizations-hook-generate-people-list-link';

import { type EmployeeListLinkProps } from './types';

export const EmployeeListLink = ({
  ids,
  type,
  children,
}: EmployeeListLinkProps) => {
  const href = useMemo(() => {
    const attributeId = type === 'department' ? 'department_id' : 'team_id';
    return buildPeopleListExtendedLink({
      filters: [
        {
          id: attributeId,
          value: { value: ids, condition: 'contains' },
        },
      ],
      columns: [attributeId],
    });
  }, [type, ids]);

  return (
    <HybridLink href={href}>
      {children} <Icon icon={icons.chevronRight} />
    </HybridLink>
  );
};
