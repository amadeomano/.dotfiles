import { useTranslation } from 'react-i18next';
import { EmptyState } from 'designSystem/component/empty-state';
import { icons } from 'designSystem/component/icon';
import { Drawer } from 'designSystem/component/panel';

import styles from './ErrorState.module.scss';

type ErrorStateProps = {
  onClose?: () => void;
};

export const ErrorState: React.FC<ErrorStateProps> = ({ onClose }) => {
  const { t } = useTranslation('org-units');

  return (
    <Drawer>
      <Drawer.Content>
        <div className={styles.wrapper}>
          <div className={styles.innerWrapper}>
            <EmptyState
              description={t('error-state.description')}
              title={t('error-state.title')}
              icon={icons.exclamationMarkTriangle}
              secondaryButton={{
                children: t('details.close'),
                onClick: onClose,
              }}
            />
          </div>
        </div>
      </Drawer.Content>
    </Drawer>
  );
};
