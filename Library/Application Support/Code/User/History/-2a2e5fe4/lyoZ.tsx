import React from 'react';

import { Avatar } from '@personio-web/design-system-component-avatar';
import { Enum } from '@personio-web/design-system-component-enum';
import { Facepile } from '@personio-web/design-system-component-facepile';
import { Icon } from '@personio-web/design-system-component-icon';
import { Inline } from '@personio-web/design-system-component-layout';
import { Link } from '@personio-web/design-system-component-link';
import type {
  MetadataItemBaseProps,
  MetadataItemEnumProps,
  MetadataItemFacePileProps,
  MetadataItemLinkProps,
  MetadataItemTextProps,
  MetadataItemTokenProps,
  MetadataItemValueProps,
} from '@personio-web/design-system-component-metadata-item-types';
import { OverflowTooltip } from '@personio-web/design-system-component-overflow-tooltip';
import { Token } from '@personio-web/design-system-component-token';

import styles from './MetadataItem.module.scss';

const MetadataItemBase: React.FC<
  React.PropsWithChildren<MetadataItemBaseProps>
> = ({ icon, children, renderHoverCard, metadata, prefix }) => {
  const Content = (
    <Inline
      space="gap-small"
      alignVertical="center"
      metadata={metadata}
      className={styles.metadataItem}
    >
      <Icon icon={icon} size="large" color="tertiary" />
      {prefix && <span className={styles.prefix}>{prefix}</span>}
      {renderHoverCard
        ? renderHoverCard({
            children: <div className={styles.overflowHidden}>{children}</div>,
          })
        : children}
    </Inline>
  );

  return Content;
};

const MetadataItemText: React.FC<MetadataItemTextProps> = ({
  avatar,
  label,
  ...props
}) => (
  <MetadataItemBase {...props}>
    <Inline alignVertical="center" className={styles.overflowHidden}>
      {avatar && (
        <div className={styles.avatar}>
          <Avatar {...avatar} size="small" />
        </div>
      )}
      <span className={styles.label}>{label}</span>
    </Inline>
  </MetadataItemBase>
);

const MetadataItemToken: React.FC<MetadataItemTokenProps> = ({
  items: tokens,
  ...props
}) => (
  <MetadataItemBase {...props}>
    <Inline space="gap-small" alignVertical="center" className={styles.meta}>
      {tokens.map((token) => (
        <Token
          key={token.id}
          {...token}
          href={props.renderHoverCard ? '#' : token.href}
        />
      ))}
    </Inline>
  </MetadataItemBase>
);

const MetadataItemFacePile: React.FC<MetadataItemFacePileProps> = ({
  items,
  label,
  ...props
}) => (
  <MetadataItemBase {...props}>
    <Inline alignVertical="center" className={styles.facePile}>
      {items && items?.length > 0 && <Facepile items={items.slice(0, 3)} />}
      <span className={styles.label}>{label}</span>
    </Inline>
  </MetadataItemBase>
);

const MetadataItemEnum: React.FC<MetadataItemEnumProps> = ({
  items: enums,
  ...props
}) => (
  <MetadataItemBase {...props}>
    <Inline space="gap-small" alignVertical="center" className={styles.meta}>
      {enums.map((item) => (
        <Enum key={item.id} {...item} />
      ))}
    </Inline>
  </MetadataItemBase>
);

const MetadataItemLink: React.FC<MetadataItemLinkProps> = ({
  icon,
  renderHoverCard,
  label,
  ...props
}) => (
  <MetadataItemBase icon={icon} renderHoverCard={renderHoverCard}>
    <Link {...props} truncate={true} className={styles.link}>
      {label}
    </Link>
  </MetadataItemBase>
);

const MetadataItemValue: React.FC<MetadataItemValueProps> = ({
  value,
  label,
  ...props
}) => (
  <MetadataItemBase {...props}>
    <OverflowTooltip>
      <span className={styles.label}>{label}</span>
    </OverflowTooltip>
    <p className={styles.value}>{value}</p>
  </MetadataItemBase>
);

export const MetadataItem = {
  Text: MetadataItemText,
  Token: MetadataItemToken,
  FacePile: MetadataItemFacePile,
  Enum: MetadataItemEnum,
  Link: MetadataItemLink,
  Value: MetadataItemValue,
};
