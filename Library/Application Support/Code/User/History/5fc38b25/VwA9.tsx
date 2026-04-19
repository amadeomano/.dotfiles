import { useTranslation } from 'react-i18next';

import { type ColumnFilter } from '@personio-web/design-system-component-advanced-filter-types';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';

import { TestIds } from '../utils';

type Props = {
  setFilters: (newFilters: ColumnFilter[]) => void;
};

export const EmptyStateWithoutNodes = ({ setFilters }: Props) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  return (
    <EmptyState
      title={t('no-employees-matching-filters.title')}
      description={t('no-employees-matching-filters.description')}
      icon={icons.magnifyingGlass}
      secondaryButton={{
        children: t('no-employees-matching-filters.clear-filters'),
        onClick: () => {
          setFilters([]);
        },
      }}
      metadata={{ testId: TestIds.EmptyStateWithoutNodes }}
    />
  );
};
