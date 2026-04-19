import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { toaster } from 'designSystem/component/toaster';
import { Controls } from 'designSystem/component/control-bar';
import { useDialogContext } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { useOrgUnitCardData } from '@personio-web/employees-organizations-gofer';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';

import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../contexts';
import { useViewportActions } from '../../../hooks';
import { SEARCH_DEBOUNCE_TIME } from '../../../constants';
import { toTranslate } from '../../../toTranslate';
import { type SourceData } from '../../../sources/data/types';
import { useGetOrgUnitByEmployeeId } from './utils/useGetOrgUnitByEmployeeId';
import {
  useGetOrgUnitSearchResults,
  ORG_UNIT_PREFIX,
} from './utils/useGetOrgUnitSearchResults';

type FocusNode = {
  node:
    | SourceData['completeHierarchyData']['data']['hierarchy']['nodes'][number]
    | null;
  isFound?: boolean;
};

export const OrgUnitSearch = () => {
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.control-bar',
  });
  const { t: tError } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.errors',
  });

  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toFocusNode, setToFocusNode] = useState<FocusNode | null>(null);
  const [lookupEmployeeId, setLookupEmployeeId] = useState<string | null>(null);
  const [selectedOrgUnitId, setSelectedOrgUnitId] = useState<string | null>(
    null,
  );

  const orgUnitSearch = useGetOrgUnitSearchResults({ searchTerm });
  const orgUnitByEmployeeId = useGetOrgUnitByEmployeeId(lookupEmployeeId);
  const cardData = useOrgUnitCardData(selectedOrgUnitId ?? '');

  if (orgUnitByEmployeeId.isFetched && !toFocusNode) {
    if (orgUnitByEmployeeId.node) {
      setToFocusNode({ node: orgUnitByEmployeeId.node, isFound: true });
      setSelectedOrgUnitId(orgUnitByEmployeeId.node.id);
    } else setToFocusNode({ node: null, isFound: false });

    setLookupEmployeeId(null);
  }

  const { openDialog } = useDialogContext();
  const [, setOrgUnitDetailsState] = useOrgUnitDetailsState();
  const viewportActions = useViewportActions();

  // Handle card data fetching and opening details drawer
  if (cardData.isSuccess && selectedOrgUnitId) {
    const data = cardData.data;

    if (data && data.type !== 'ORG_UNIT_TYPE_UNSPECIFIED') {
      const orgUnitType =
        data.type === 'ORG_UNIT_TYPE_DEPARTMENT' ? 'department' : 'team';
      let orgUnitId: number | undefined;

      if (
        data.departmentId?.__typename ===
        'protocore_hrdepartmentid_DepartmentId_v1'
      ) {
        orgUnitId = parseInt(data.departmentId.id);
      } else if (data.teamId?.__typename === 'protocore_hrteamid_TeamId_v1') {
        orgUnitId = parseInt(data.teamId.id);
      }

      if (orgUnitId && !Number.isNaN(orgUnitId)) {
        setOrgUnitDetailsState({
          orgUnitId,
          orgUnitType,
        });
      }
    }

    setSelectedOrgUnitId(null);
  }

  if (toFocusNode) {
    if (toFocusNode.node) {
      const activeAncestorIds = toFocusNode.node.ancestors.map(
        (ancestor) => ancestor.id,
      );
      prefs.setActiveCardId(toFocusNode.node.id, activeAncestorIds);

      // Only expand and focus if the node has a parent
      // if (toFocusNode.node.parent)
      viewportActions.findAndFocusOnNodeBranch(toFocusNode.node.id);
    } else if (!toFocusNode.isFound) {
      toaster.notify({
        variant: 'error',
        title: tError('focus.title'),
        description: tError('focus.description'),
        showCloseButton: true,
      });
    }

    setSearchTerm('');
    setToFocusNode(null);
  }

  const onSearchResultSelect = useCallback(
    (id: string) => {
      const isOrgUnit = id.startsWith(ORG_UNIT_PREFIX);
      const selectionId = isOrgUnit ? id.slice(ORG_UNIT_PREFIX.length) : id;

      if (isOrgUnit) {
        const node = dataSource.displayableHierarchy.getNode(selectionId);
        if (node) {
          setToFocusNode({ node, isFound: true });
          setSelectedOrgUnitId(selectionId);
        } else if (dataSource.isFiltering)
          openDialog('org-chart.remove-filters', { employeeId: selectionId });
        else setToFocusNode({ node: null, isFound: false });
      } else {
        setLookupEmployeeId(selectionId);
      }
    },
    [dataSource],
  );

  return (
    <Controls.Search
      value={searchTerm}
      onTextChange={setSearchTerm}
      placeholder={t('', {
        defaultValue: toTranslate.orgChart.controlBar.orgUnitSearch.label,
        orgunitType: prefs.source === 'Department' ? 'Department' : 'Team',
      })}
      searchResults={orgUnitSearch.searchResults}
      loading={orgUnitSearch.isLoading || orgUnitByEmployeeId.isLoading}
      onSearchResultSelect={onSearchResultSelect}
      searchDebounceTime={SEARCH_DEBOUNCE_TIME}
    />
  );
};
OrgUnitSearch.displayName = 'Controls.Search';
