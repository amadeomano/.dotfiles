import { useMemo } from 'react';

import { HybridLink } from 'designSystem/component/link';
import { Icon, icons } from 'designSystem/component/icon';
import { buildPeopleListExtendedLink } from '@personio-web/employees-organizations-hook-generate-people-list-link';

import { type EmployeeListLinkProps } from './types';

export const EmployeeListLink = ({
  ids,
  type,
  children,
  excludeInactive = false,
}: EmployeeListLinkProps) => {
  const href = useMemo(() => {
    const attributeId = type === 'department' ? 'department_id' : 'team_id';
    const filters: Array<{
      id: string;
      value: {
        value: string[];
        condition: 'contains' | 'does_not_contain';
      };
    }> = [
      {
        id: attributeId,
        value: { value: ids, condition: 'contains' },
      },
    ];

    if (excludeInactive) {
      filters.push({
        id: 'status',
        value: { value: ['inactive'], condition: 'does_not_contain' },
      });
    }

    return buildPeopleListExtendedLink({
      filters,
      columns: [attributeId],
    });
  }, [type, ids, excludeInactive]);

  return (
    <HybridLink href={href}>
      {children} <Icon icon={icons.chevronRight} />
    </HybridLink>
  );
};
