import { useMemo } from 'react';

import classnames from 'classnames';

import { parseMetadata } from '@personio-web/design-system-utils';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';

import { useGetPersonCardData } from '../../hooks';
import { RelationshipTypes, type Reports } from '../../types';
import { TestIds } from '../../utils';
import { Body } from '../Body';
import { CardMenu } from '../CardMenu';
import { MIN_CARD_HEIGHT } from '../constants';
import { Header } from '../Header';
import { Highlight } from '../Highlight';
import { LoadingCard } from '../LoadingCard';
import { SpanOfControl } from '../SpanOfControl';
import { NodeType, type PersonCardComponent } from '../types';

import styles from './PersonCard.module.scss';

export const PersonCard: PersonCardComponent = ({
  id,
  entity_id,
  attributeIds = [
    PersonSystemAttribute.Department,
    PersonSystemAttribute.Position,
  ],
  highlightedAttributeId,
  height = MIN_CARD_HEIGHT,
  group,
  reports: reps,
  type = NodeType.Person,
  isActive,
  isIncluded,
  isFocused,
  hidePersonalInfo,
  hideAvatars,
  onClick,
  additionalSupervisorAttributes,
}) => {
  const visibleAttributeIds = useMemo(
    () => [
      ...new Set([
        ...(attributeIds ?? []),
        ...(highlightedAttributeId ? [highlightedAttributeId] : []),
      ]),
    ],
    [attributeIds, highlightedAttributeId],
  );

  const additionalSupervisorAttributeIds =
    additionalSupervisorAttributes &&
    Object.keys(additionalSupervisorAttributes);

  const {
    person,
    additionalRelationships,
    status,
    attributes,
    isAccessible,
    loading,
  } = useGetPersonCardData(entity_id, {
    attributeIds: visibleAttributeIds,
    additionalSupervisorAttributeIds,
  });

  const additionals = useMemo(() => {
    /*
     * If there are no additional supervisor attributes, return an empty array.
     * If the node is part of an additional relationship group, it won't contain any position or
     * subordinate relationship, so returning an empty array will hide the span of control.
     */
    if (!additionalSupervisorAttributes || group?.id) {
      return [];
    }

    return Object.entries(additionalSupervisorAttributes)
      .map(([key, name]) => {
        const countSupervisors =
          additionalRelationships?.filter(
            (relationship) =>
              relationship?.attributeId === key &&
              relationship?.type === RelationshipTypes.Supervisor,
          ).length || 0;

        const countReports =
          additionalRelationships?.filter(
            (relationship) =>
              relationship?.attributeId === key &&
              relationship?.type === RelationshipTypes.Subordinate,
          ).length || 0;

        return { name, countSupervisors, countReports };
      })
      .filter(
        ({ countSupervisors, countReports }) =>
          countSupervisors > 0 || countReports > 0,
      );
  }, [additionalRelationships, additionalSupervisorAttributes, group?.id]);

  const reports: Reports = {
    ...reps,
    people: reps?.people ?? { total: 0, direct: 0 },
    additionals,
  };

  if (loading && !person) {
    return (
      <LoadingCard
        attributesCount={Math.min(attributeIds.length, 4)}
        withHighlight={!!highlightedAttributeId}
      />
    );
  }

  const cardAttributes = attributes?.filter((item) =>
    attributeIds?.includes(item.id),
  );

  const highlightedAttribute = highlightedAttributeId
    ? attributes?.find((attribute) => attribute.id === highlightedAttributeId)
    : undefined;

  return (
    <CardMenu person={person} isIncluded={isIncluded}>
      <div
        className={classnames(styles.personCard, {
          [styles.inaccessible]: !isAccessible,
          [styles.isActive]: isActive,
          [styles.isFocused]: isFocused,
          [styles.expandable]: Boolean(
            reports?.people.total || reports?.positions?.total,
          ),
        })}
        style={{ height }}
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          // TODO: Open details drawer with Enter
          if (e.key === ' ') {
            onClick?.();
          }
        }}
        {...parseMetadata({ testId: `${TestIds.PersonCard}-${id}` })}
      >
        {highlightedAttribute && <Highlight attribute={highlightedAttribute} />}
        <Header isUnmatched={type === NodeType.UnmatchedPerson}>
          {isAccessible ? (
            <Header.Person
              id={entity_id}
              src={person?.profilePicUrls?.paths?.large ?? undefined}
              name={
                person?.preferredName?.value ?? undefined + `(${person?.id})`
              }
              status={status}
              isActive={isActive}
              hidePersonalInfo={hidePersonalInfo}
              hideAvatar={hideAvatars}
            />
          ) : (
            <Header.NotVisible hideAvatar={hideAvatars} />
          )}
        </Header>
        <Body
          type={type}
          attributes={cardAttributes}
          isAccessible={isAccessible}
        />

        <div
          className={classnames(styles.spanOfControl, {
            [styles.isActive]: isActive,
            [styles.noReports]:
              !reports?.people.total &&
              !reports?.positions?.total &&
              !reports?.additionals?.length,
          })}
        >
          <SpanOfControl
            reports={reports}
            isActive={isActive}
            person={person}
            isIncluded={isIncluded}
          />
        </div>
      </div>
    </CardMenu>
  );
};
