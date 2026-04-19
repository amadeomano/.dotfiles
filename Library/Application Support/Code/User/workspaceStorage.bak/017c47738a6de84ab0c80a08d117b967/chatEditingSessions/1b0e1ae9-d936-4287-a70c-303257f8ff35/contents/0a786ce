import { useMemo, useEffect } from 'react';

import classnames from 'classnames';
import { useTranslation } from 'react-i18next';

import { useAmplitude } from '@personio-web/amplitude-provider';
import type { ColumnFilter } from 'designSystem/component/advanced-filter';
import {
  useGetEmployeeListColumns,
  useGetEmployeeListMetadata,
} from '@personio-web/employees-organizations-data-people-list';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { usePeopleFilterConfig } from '@personio-web/employees-organizations-hook-use-people-filter-config';
import {
  ControlBar as DSControlBar,
  Controls,
} from 'designSystem/component/control-bar';
import { DropdownMenu } from 'designSystem/component/dropdown-menu';
import { icons } from 'designSystem/component/icon';

import type { ControlBarProps } from './types';

import { SEARCH_DEBOUNCE_TIME } from '../constants';
import * as Amp from '../constants/amplitude';
import { ExportFormat, exportNodes, useTreeLayout } from '../TreeLayout';
import { type HierarchyTreeNode } from '../types';
import { TestIds } from '../utils';
import ControlBarCards from './components/ControlBarCards';
import ControlBarHighlight from './components/ControlBarHighlight';
import {
  ControlBarSpotlight,
  SpotlightIcon,
} from './components/ControlBarSpotlight';
import { ExportLimitationDialog } from './components/ExportLimitationDialog';
import { exportOptions } from './consts/exportConfig';
import { filterAttributes, getFilterColumnConfig } from './consts/filterConfig';
import { viewLabelsMap } from './consts/viewsConfig';

import styles from './ControlBar.module.scss';

export const ControlBar = ({
  disabled,
  searchTerm,
  setSearchTerm,
  filters,
  setFilters,
  view,
  setView,
  cardPreferences,
  setCardPreferences,
  attributes,
  setAttributes,
  highlighted,
  setHighlighted,
  focusedEmployeeId,
  spotlight,
  spotlightPersonName,
  spotlightVisibleRelationships,
  setSpotlightVisibleRelationships,
  setSpotlight,
  sortByAttribute,
  setSortByAttribute,
  onSearchResultSelect,
  searchResults,
  areSearchResultsLoading,
  hierarchy,
  additionalSupervisorAttributes,
  setIsExporting,
  isSavedViewsOpen,
  setIsSavedViewsOpen,
}: ControlBarProps) => {
  const { track } = useAmplitude();
  const { openDialog } = useDialogContext();
  const { getNodes, viewportInitialized } = useTreeLayout<HierarchyTreeNode>();

  const {
    mutate,
    data: employeeListMetadata,
    isLoading: employeeListMetadataLoading,
  } = useGetEmployeeListMetadata();

  useEffect(() => {
    mutate({ requestBody: {} });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useGetEmployeeListColumns({
    requestQuery: {
      enrich_employee_info_attributes: true,
    },
  });

  const accessibleFilterAttributes = useMemo(() => {
    if (!isLoading && data?.data) {
      const attributeIds = data.data.map((d) => d.value);
      return filterAttributes.filter((item) =>
        attributeIds.includes(item.attributeId),
      );
    }
    return [];
  }, [data, isLoading]);

  const filterConfig = usePeopleFilterConfig(accessibleFilterAttributes);

  const highlightAttributeLabel = useMemo(
    () =>
      !!highlighted &&
      data?.data.find((item) => item.value === highlighted)?.label,
    [data?.data, highlighted],
  );

  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar',
  });
  const { t: tErrors } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });
  const { t: tAttributes } = useTranslation('models', {
    keyPrefix: 'employee',
  });

  const visibleAttributeIds = useMemo(
    () => [
      ...new Set([
        ...(attributes ?? []),
        ...(highlighted ? [highlighted] : []),
      ]),
    ],
    [attributes, highlighted],
  );

  const isFirefox = navigator.userAgent.includes('Firefox');

  const hasExportAccess =
    !employeeListMetadataLoading &&
    employeeListMetadata?.data?.accessRights?.canExportEmployeeList;

  const handleExportSelection = (format: ExportFormat) => {
    const isSafari = navigator.userAgent.includes('Safari'); // &&
    // !navigator.userAgent.includes('Chrome');

    if (isSafari && [ExportFormat.PNG, ExportFormat.PNG_BG].includes(format)) {
      openDialog('org-chart.export-limitation', {});
      return;
    }

    track(Amp.EXPORTED, {
      format,
      triggered_from: 'org-chart-menu',
    });
    setIsExporting(true);
    exportNodes<HierarchyTreeNode>({
      format,
      nodes: getNodes(),
      onFinish: () => setIsExporting(false),
      t: tErrors,
    });
  };

  return (
    <div
      className={classnames(styles.container, { [styles.disabled]: disabled })}
    >
      <DSControlBar>
        <Controls.SavedViews
          label={view ? t(viewLabelsMap[view]) : t('views.label')}
          onClick={() => setIsSavedViewsOpen(!isSavedViewsOpen)}
          open={isSavedViewsOpen}
          metadata={{
            testId: TestIds.ControlBarViews,
          }}
        />

        <Controls.Filter
          filters={filters}
          filterConfig={filterConfig}
          columnConfig={getFilterColumnConfig(tAttributes, visibleAttributeIds)}
          metadata={{ testId: TestIds.ControlBarFilter }}
          disabled={Boolean(spotlight)}
          onChange={(filters: ColumnFilter[]) => {
            if (view) {
              setView(null);
            }

            setFilters(filters);
          }}
        />

        <Controls.Custom
          label={t('cards.customize-label')}
          icon={icons.badgeIdHorizontal}
          metadata={{ testId: TestIds.ControlBarCards }}
        >
          <ControlBarCards
            cardPreferences={cardPreferences}
            setCardPreferences={setCardPreferences}
            attributes={attributes}
            setAttributes={setAttributes}
          />
        </Controls.Custom>

        <Controls.Custom
          label={
            highlighted && highlightAttributeLabel
              ? `${t('highlight.by')} ${highlightAttributeLabel}`
              : t('highlight.label')
          }
          icon={icons.lightBulb}
          isActive={!!highlighted || sortByAttribute}
          onClear={() => setHighlighted('')}
          metadata={{ testId: TestIds.ControlBarHighlight }}
        >
          <ControlBarHighlight
            highlighted={highlighted}
            setHighlighted={setHighlighted}
            sortByAttribute={sortByAttribute}
            setSortByAttribute={setSortByAttribute}
          />
        </Controls.Custom>

        <Controls.Custom
          label={
            spotlight && spotlightPersonName
              ? `${t('spotlight.title')}: ${spotlightPersonName}`
              : t('spotlight.title')
          }
          icon={SpotlightIcon}
          isActive={!!spotlight}
          onClear={() => setSpotlight('')}
          metadata={{ testId: TestIds.ControlBarSpotlight }}
        >
          <ControlBarSpotlight
            focusedEmployeeId={focusedEmployeeId}
            spotlight={spotlight}
            setSpotlight={setSpotlight}
            hierarchy={hierarchy}
            additionalSupervisorAttributes={additionalSupervisorAttributes}
            spotlightVisibleRelationships={spotlightVisibleRelationships}
            setSpotlightVisibleRelationships={setSpotlightVisibleRelationships}
          />
        </Controls.Custom>

        <Controls.Search
          value={searchTerm}
          onTextChange={setSearchTerm}
          placeholder={t('search.label')}
          searchResults={searchResults}
          loading={areSearchResultsLoading}
          onSearchResultSelect={onSearchResultSelect}
          searchDebounceTime={SEARCH_DEBOUNCE_TIME}
        />

        <Controls.Share>
          <DropdownMenu.Item
            id="copy_url"
            name={t('share.copy-url')}
            icon={icons.link}
            onSelect={() =>
              navigator?.clipboard?.writeText(window.location.href)
            }
          />
          {viewportInitialized &&
            hasExportAccess &&
            (isFirefox ? (
              <DropdownMenu.Item
                id="export"
                name={t('share.export')}
                icon={icons.rectangleHorizontalArrowDown}
                onSelect={() => openDialog('org-chart.export-limitation', {})}
              />
            ) : (
              <DropdownMenu.Sub
                trigger={
                  <DropdownMenu.SubTrigger
                    name={t('share.export')}
                    icon={icons.rectangleHorizontalArrowDown}
                  />
                }
              >
                {exportOptions.map((format) => (
                  <DropdownMenu.Item
                    key={format}
                    id={format}
                    name={t(`share.export-${format.toLowerCase()}`, {
                      defaultValue: t('share.export-as', { format }),
                    })}
                    onSelect={() => handleExportSelection(format)}
                  />
                ))}
              </DropdownMenu.Sub>
            ))}
        </Controls.Share>
      </DSControlBar>
      <ExportLimitationDialog />
    </div>
  );
};
