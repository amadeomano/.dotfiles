import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Popover } from 'designSystem/component/popover';
import { Inline, Stack } from 'designSystem/component/layout';

import classNames from 'classnames';
import { Avatar } from 'designSystem/component/avatar';
import { Title } from 'designSystem/component/panel';
import { toTranslate } from '../../org-unit-details/toTranslate';
import styles from './OrgUnitsLeadsPromoTag.module.scss';

type TokenProps = {
  disabled?: boolean;
};

type PersonItemProps = {
  name: string;
  title: string;
  avatar: string;
};

const NewToken = ({ disabled = false }: TokenProps) => {
  const { t } = useTranslation('org-units');

  return (
    <div className={classNames(styles.token, { [styles.disabled]: disabled })}>
      {t('promotion.new-tag')}
    </div>
  );
};

const PersonItem = ({ name, title, avatar }: PersonItemProps) => (
  <div className={styles.personItemContainer}>
    <Inline space="gap-default" className={styles.personItem}>
      <Avatar size="large" src={avatar} name={name} />
      <Stack>
        <Title>{name}</Title>
        <p className={styles.subTitle}>{title}</p>
      </Stack>
    </Inline>
  </div>
);

const OrgUnitsLeadsPromoTag = () => {
  const { t } = useTranslation('org-units');

  const [isPopoverOpened, setIsPopoverOpened] = useState(false);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const open = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    setIsPopoverOpened(true);
  };

  const close = () => {
    closeTimeout.current = setTimeout(() => {
      setIsPopoverOpened(false);
    }, 150);
  };

  return (
    <Popover
      open={isPopoverOpened}
      onOpenChange={(open) => setIsPopoverOpened(open)}
    >
      <Popover.Trigger>
        <div
          onMouseEnter={open}
          onMouseLeave={close}
          data-test-id="leads-promo-tag"
        >
          <NewToken />
        </div>
      </Popover.Trigger>
      <Popover.Content
        side="left"
        avoidCollisions
        sideOffset={10}
        onMouseEnter={open}
        onMouseLeave={close}
      >
        <Stack space="gap-large">
          <div className={styles.popoverContentHeader}>
            <NewToken disabled />
            <Stack space="gap-small" className={styles.popoverContentList}>
              <PersonItem
                name="Damon White"
                title={t('leads.positions.coo')}
                avatar="https://assets.cdn.personio.de/build/client/img/avatar-samples/avatar-1.jpg"
              />
              <PersonItem
                name="Franzi Holz"
                title={t('leads.positions.csx')}
                avatar="https://assets.cdn.personio.de/build/client/img/avatar-samples/avatar-2.jpg"
              />
              <PersonItem
                name="Brenna Stevens"
                title={t('leads.positions.csl')}
                avatar="https://assets.cdn.personio.de/build/client/img/avatar-samples/avatar-3.jpg"
              />
            </Stack>
          </div>
          <Stack space="gap-large" className={styles.popoverContentFooter}>
            <h3>{t('leads.title')}</h3>
            <h5 className={styles.subHeader}>
              {t('leads.subtitle', {
                maxAllowedLeads: 3,
                defaultValue: toTranslate.leads.subtitle,
              })}
            </h5>
          </Stack>
        </Stack>
      </Popover.Content>
    </Popover>
  );
};

export default OrgUnitsLeadsPromoTag;
