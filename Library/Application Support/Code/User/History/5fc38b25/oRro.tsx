import { useTranslation } from 'react-i18next';
import { type ParseKeys, type TOptions } from 'i18next';

import { type ColumnFilter } from 'designSystem/component/advanced-filter';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';

import { TestIds } from '../utils';
import { type Source } from '../sources/preferences/types';
import { useOrgChartPreferencesContext } from '../contexts/useOrgChartPreferences';

type Props = {
  setFilters: (newFilters: ColumnFilter[]) => void;
};

const sourceDisplayMap: Record<
  Source,
  ParseKeys<'employees-organizations', TOptions, 'org-chart.empty-state'>
> = {
  Supervisor: 'source_supervisor',
  Department: 'source_department',
  Team: 'source_team',
};

export const EmptyStateWithoutNodes = ({ setFilters }: Props) => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.empty-state',
  });
  const { t: tErrors } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });
  const prefs = useOrgChartPreferencesContext();

  return (
    <EmptyState
      title={t('title')}
      description={t('description', {
        source: tSource(sourceDisplayMap[prefs.source]),
      })}
      icon={icons.magnifyingGlass}
      secondaryButton={{
        children: tErrors('no-employees-matching-filters.clear-filters'),
        onClick: () => {
          setFilters([]);
        },
      }}
      metadata={{ testId: TestIds.EmptyStateWithoutNodes }}
    />
  );
};
