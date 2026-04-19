import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';

import { Link } from 'designSystem/component/link';
import { useOrgUnitCardData } from '@personio-web/employees-organizations-gofer';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';

import { useAmplitude } from '@personio-web/amplitude-provider';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { CardShell } from '../../../Card/CardShell';
import {
  useOrgChartDataSourceContext,
  useOrgChartPreferencesContext,
} from '../../../contexts';
import { useViewportActions } from '../../../hooks';
import { TestIds } from '../../../utils/test-ids';

import { NodeMap } from '../../../Nodes/constants';
import { type CustomisationId } from '../../customs/orgunit';
import * as Amp from '../../../constants/amplitude';
import { FeatureFlags } from '../../../constants/featureFlags';
import { Members } from './Sections/Members/Members';
import { Leads } from './Sections/Leads/Leads';
import { SpanOfControl } from './Sections/SpanOfControl/SpanOfControl';
import { useCalcOrgUnitCardHeight } from './useCalcCardHeight';
import styles from './OrgUnitCard.module.scss';

type OrgUnitCardProps = { id: string };

export const OrgUnitCard = ({ id }: OrgUnitCardProps) => {
  const { track } = useAmplitude();
  const prefs = useOrgChartPreferencesContext();
  const dataSource = useOrgChartDataSourceContext();
  const { t } = useTranslation('employees-organizations', {
    keyPrefix: 'org-chart.org-unit-card.accessible-labels',
  });
  const cardData = useOrgUnitCardData(id);
  const { isOn: isLeadsEnabled } = useFeatureFlag(
    FeatureFlags.ENABLE_ORG_UNIT_LEADS,
  );

  const cardHeight = useCalcOrgUnitCardHeight(dataSource.completeHierarchyData);

  const node = useMemo(
    () => dataSource.displayableHierarchy.getNode(id),
    [id, dataSource.displayableHierarchy],
  );

  const getOrgUnitTypeFromCardData = useCallback(
    (data: typeof cardData.data) => {
      if (!data || data.type === 'ORG_UNIT_TYPE_UNSPECIFIED') return undefined;

      return data.type === 'ORG_UNIT_TYPE_DEPARTMENT' ? 'department' : 'team';
    },
    [],
  );

  const getOrgUnitIdFromCardData = useCallback(() => {
    const data = cardData.data;
    if (!data) return undefined;

    const cardType = getOrgUnitTypeFromCardData(data);
    if (data.type === 'ORG_UNIT_TYPE_UNSPECIFIED') return undefined;

    let orgUnitId: number | undefined;

    if (
      data.departmentId?.__typename ===
      'protocore_hrdepartmentid_DepartmentId_v1'
    ) {
      orgUnitId = parseInt(data.departmentId.id);
    } else if (data.teamId?.__typename === 'protocore_hrteamid_TeamId_v1') {
      orgUnitId = parseInt(data.teamId.id);
    }

    return orgUnitId && !Number.isNaN(orgUnitId) ? orgUnitId : undefined;
  }, [cardData.data]);

  const { state: drawerDetails, setState: setDetailsDrawer } =
    useOrgUnitDetailsState();

  const viewportActions = useViewportActions();
  const currentCardOrgUnitId = getOrgUnitIdFromCardData();
  const isDrawerShowingThisCard =
    drawerDetails !== null &&
    currentCardOrgUnitId !== undefined &&
    drawerDetails.orgUnitId === currentCardOrgUnitId;

  const handleClick = useCallback(() => {
    if (!node) return;
    const isExpandable = node.children && node.children.length > 0;

    const activeAncestorIds = node.ancestors
      .map((ancestor) => ancestor.id)
      .concat([node.id]);
    prefs.setActiveCardId(node.id, activeAncestorIds);

    const isDrawerShowingDifferentCard =
      drawerDetails !== null &&
      currentCardOrgUnitId !== undefined &&
      drawerDetails.orgUnitId !== currentCardOrgUnitId;

    if (isDrawerShowingDifferentCard) {
      const orgUnitType = getOrgUnitTypeFromCardData(cardData.data);
      if (orgUnitType) {
        setDetailsDrawer({ orgUnitId: currentCardOrgUnitId, orgUnitType });
      }
      return;
    }

    // Return early if the expansion logic is not applicable
    if (!isExpandable) return;

    const currentExpanded =
      prefs.expansionState.derivedExpandedIds.current ??
      prefs.expansionState.expanded;
    let nextExpanded: string[] = [];
    let focusNodeIds: string[] = [];
    let actionType: 'expand' | 'collapse' | undefined;

    // Expaning
    if (!currentExpanded.includes(node.id)) {
      focusNodeIds = [
        node.id,
        ...(node.children ?? []).map((child) => child.id),
      ];
      nextExpanded = [...currentExpanded, node.id];
      actionType = 'expand';
    }
    // Collapsing
    else if (
      currentExpanded.includes(node.id) &&
      prefs.activeCardId === node.id
    ) {
      actionType = 'collapse';
      if (node.parent) {
        focusNodeIds = [
          node.parent.id,
          ...(node.parent.children ?? []).map((child) => child.id),
        ];
      }
      nextExpanded = currentExpanded.filter(
        (id) =>
          id !== node.id &&
          !node.children?.map((child) => child.id).includes(id),
      );
    }
    // No change (if the node is already expanded but not focused)
    else nextExpanded = [...currentExpanded];

    // Return early if the expansion state is not changing
    if (
      currentExpanded.slice().sort().join() ===
      nextExpanded.slice().sort().join()
    )
      return;
    prefs.expansionState.setExpanded(nextExpanded);

    if (nextExpanded.length === 0) {
      prefs.viewportState.requestNewState({
        mode: 'resetViewport',
        animated: true,
      });
    } else if (focusNodeIds.length) {
      viewportActions.fitNodes(focusNodeIds, {
        allowZoomIn: false,
        optionalCentering: true,
      });
    }

    if (actionType) {
      track(Amp.INTERACTED_CARD, {
        action_type: actionType,
        org_chart_source: prefs.source,
      });
    }
  }, [prefs.expansionState.expanded, prefs.activeCardId, drawerDetails]);

  const hasAbbreviationData = useMemo(
    () => cardData.data?.abbreviation && cardData.data.abbreviation.length > 0,
    [cardData.status],
  );

  const isAbbreviationVisible = useMemo(
    () =>
      prefs.cardCustomisations.get<CustomisationId>('abbreviation')?.isActive,
    [prefs.cardCustomisations],
  );

  const hasDescriptionData = useMemo(
    () => cardData.data?.description && cardData.data.description.length > 0,
    [cardData.status],
  );

  const isDescriptionVisible = useMemo(
    () =>
      prefs.cardCustomisations.get<CustomisationId>('description')?.isActive,
    [prefs.cardCustomisations],
  );

  const isLeadsVisible = useMemo(
    () =>
      isLeadsEnabled &&
      prefs.cardCustomisations.get<CustomisationId>('leads')?.isActive,
    [isLeadsEnabled, prefs.cardCustomisations],
  );

  const isUnmatched = useMemo(
    () => node?.data.type === NodeMap.UnmatchedOrgUnit,
    [node],
  );

  const isActive = useMemo(
    () =>
      dataSource.visibleChartData.nodes.find((node) => node.id === id)?.data
        .isActive,
    [prefs.activeCardId],
  );

  const isFocused = useMemo(() => {
    if (!drawerDetails) return false;
    const cardOrgUnitId = getOrgUnitIdFromCardData();
    return drawerDetails.orgUnitId === cardOrgUnitId;
  }, [drawerDetails, getOrgUnitIdFromCardData]);

  const handleOpenDetailsDrawer = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const orgUnitType = getOrgUnitTypeFromCardData(cardData.data);
      const orgUnitId = getOrgUnitIdFromCardData();

      if (!orgUnitType || !orgUnitId || !node) return;

      const activeAncestorIds = node.ancestors
        .map((ancestor) => ancestor.id)
        .concat([node.id]);
      prefs.setActiveCardId(node.id, activeAncestorIds);
      setDetailsDrawer({ orgUnitId, orgUnitType });
    },
    [cardData.data, setDetailsDrawer, getOrgUnitIdFromCardData],
  );

  return useMemo(
    () => (
      <CardShell
        className={classnames(styles.orgUnitCard, {
          [styles.isActive]: isActive || isDrawerShowingThisCard,
          [styles.isFocused]: isFocused,
        })}
        onClick={handleClick}
        style={{ height: cardHeight }}
        tabIndex={0}
        role="treeitem"
        aria-selected={isDrawerShowingThisCard}
      >
        <Link
          target="_blank"
          rel="noopener noreferrer"
          href={undefined} // link to
          onClick={handleOpenDetailsDrawer}
          metadata={{ testId: TestIds.OrgUnitCardName }}
          className={classnames(styles.name, {
            [styles.unmatched]: isUnmatched,
          })}
        >
          {cardData.data?.name}
        </Link>
        {isDescriptionVisible && (
          <p
            aria-label={t('description', {
              description: hasDescriptionData
                ? cardData.data?.description
                : t('description_none'),
            })}
            className={classnames(styles.description, {
              [styles.unmatched]: isUnmatched,
            })}
          >
            {hasDescriptionData ? cardData.data?.description : null}
          </p>
        )}
        {isAbbreviationVisible && (
          <p
            aria-label={t('code', {
              code: hasAbbreviationData
                ? cardData.data?.abbreviation
                : t('code_none'),
            })}
            className={classnames(styles.abbreviation, {
              [styles.unmatched]: isUnmatched,
            })}
          >
            {hasAbbreviationData ? `#${cardData.data?.abbreviation}` : null}
          </p>
        )}
        {isLeadsVisible && cardData.data && (
          <Leads orgUnit={cardData.data} isUnmatched={isUnmatched} />
        )}
        {cardData.data && (
          <Members orgUnit={cardData.data} isUnmatched={isUnmatched} />
        )}
        <SpanOfControl node={node} type={cardData.data?.type} />
      </CardShell>
    ),
    [
      id,
      cardData.data,
      hasDescriptionData,
      isDescriptionVisible,
      hasAbbreviationData,
      isAbbreviationVisible,
      isLeadsVisible,
      cardHeight,
      handleClick,
    ],
  );
};
