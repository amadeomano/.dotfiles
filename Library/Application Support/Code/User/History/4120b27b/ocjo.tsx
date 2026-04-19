import { useMemo } from 'react';

import { Trans } from 'react-i18next';
import { useNavigate } from 'react-router';
import { Skeleton } from '@highlight-ui/skeleton';
import { Tab, TabItem } from '@highlight-ui/tab';
import { Tooltip } from '@highlight-ui/tooltip';
import { Body, Heading } from '@highlight-ui/typography';
import classNames from 'classnames';

import { Icon, icons } from 'designSystem/component/icon';

import { FeatureFlag } from '../../../../application/config/constants';
import { TEST_IDS } from '../../../../config/tests';
import { ErrorEnum } from '../../../../shared/components/error-enum/ErrorEnum';
import { Translate } from '../../../../shared/components/translate';
import { useSelectedPermanentEstablishmentContext } from '../../../../shared/context/SelectedPermanentEstablishmentsContext';
import { dateFormatter } from '../../../../shared/helpers/dateUtils';
import {
  useEntities,
  useModeRouteState,
  useT,
  useGetUniqueServerErrorsCount,
} from '../../../../shared/hooks';
import {
  useCanWrite,
  useIsFeatureFlagEnabled,
} from '../../../../shared/hooks/utils';
import { usePayrollPEAttributes } from '../../payroll-attributes';

import { MainHeaderActions } from './MainHeaderActions';
import styles from './MainHeader.module.scss';

enum Tabs {
  Details = 'details',
  PayrollAttributes = 'payroll-attributes',
}

export const MainHeader: React.FC<React.PropsWithChildren<unknown>> = () => {
  const t = useT();
  const { isFetching } = useEntities();
  const hidePayrollRelatedSettingsFFEnabled = useIsFeatureFlagEnabled(
    FeatureFlag.HidePayrollRelatedSettings,
  );

  const isEditPermanentEstablishmentRegistrationDateEnabled =
    useIsFeatureFlagEnabled(
      FeatureFlag.EditPermanentEstablishmentRegistrationDate,
    );

  const { selectedPermanentEstablishment } =
    useSelectedPermanentEstablishmentContext();
  const { isCreateMode, isDetailsRoute } = useModeRouteState();
  const { getUniqueServerErrorsCount } = useGetUniqueServerErrorsCount();

  const canWrite = useCanWrite();

  const navigate = useNavigate();
  const currentTab = isDetailsRoute ? Tabs.Details : Tabs.PayrollAttributes;
  const { payrollPEValidationResults } = usePayrollPEAttributes();

  const tabChangeHandler = (tab: string) => {
    navigate(
      `${tab === Tabs.Details ? 'details' : 'payroll'}/${
        selectedPermanentEstablishment?.id
      }`,
    );
  };

  const validationErrors =
    selectedPermanentEstablishment?.metadata?.validationErrors;

  const validationErrorsCount = useMemo(
    () => getUniqueServerErrorsCount(validationErrors),
    [validationErrors, getUniqueServerErrorsCount],
  );

  const hasValidationErrors = validationErrorsCount > 0;
  const payrollValidationResultsCount = payrollPEValidationResults.length;
  const hasPayrollValidationResults = payrollValidationResultsCount > 0;

  if (isFetching) {
    return (
      <div className={styles.mainHeaderSkeleton}>
        <Skeleton
          height={32}
          metadata={{ testId: TEST_IDS.PE_FORM.SKELETONS.ATTRIBUTES_HEADER }}
        />
      </div>
    );
  }

  if (isCreateMode) {
    return (
      <div className={styles.mainHeaderContainer}>
        <Heading as="span" variant="large">
          {t('new-permanent-establishment')}
        </Heading>
      </div>
    );
  }

  return (
    <div
      className={classNames(styles.mainHeaderContainer, {
        [styles.withTab]: !hidePayrollRelatedSettingsFFEnabled,
      })}
    >
      <p>Howdy</p>
      <div className={styles.mainHeaderBar}>
        <div className={styles.mainHeaderTitleWrapper}>
          <div className={styles.mainHeaderTitle}>
            <Heading
              as="span"
              metadata={{
                testId: TEST_IDS.PERMANENT_ESTABLISHMENT_HEADER.TITLE,
              }}
              variant="large"
            >
              {selectedPermanentEstablishment?.name}

              {hidePayrollRelatedSettingsFFEnabled && hasValidationErrors && (
                <ErrorEnum count={validationErrorsCount} />
              )}
            </Heading>
          </div>

          {selectedPermanentEstablishment?.validFrom && (
            <Tooltip
              content={
                isEditPermanentEstablishmentRegistrationDateEnabled
                  ? t('edit-registration-date.tooltip.info')
                  : undefined
              }
            >
              <div
                className={classNames(
                  styles.info,
                  isEditPermanentEstablishmentRegistrationDateEnabled &&
                    styles.tooltipInfo,
                )}
                data-test-id={
                  TEST_IDS.PERMANENT_ESTABLISHMENT_HEADER.REGISTRATION_DATE
                }
              >
                <Icon icon={icons.calendar} />
                <Body color="text-subdued" variant="small">
                  <Translate
                    i18nKey="main-header.registered-on"
                    values={{
                      registrationDate: dateFormatter(
                        new Date(selectedPermanentEstablishment.validFrom),
                      ),
                    }}
                  />
                </Body>
              </div>
            </Tooltip>
          )}
        </div>
        {canWrite && selectedPermanentEstablishment?.status === 'ACTIVE' && (
          <MainHeaderActions />
        )}
      </div>

      {!hidePayrollRelatedSettingsFFEnabled && (
        <Tab onChange={tabChangeHandler} placement="left" value={currentTab}>
          <TabItem name={Tabs.Details}>
            {t('main-header.general-settings-tab-label')}
            {hasValidationErrors && <ErrorEnum count={validationErrorsCount} />}
          </TabItem>
          <TabItem
            // The metadata object doesn't work here.
            data-test-id={TEST_IDS.PE_FORM.TAB.PAYROLL}
            name={Tabs.PayrollAttributes}
          >
            <Trans
              i18nKey="main-header.payroll-settings-tab-label"
              ns="permanent-establishments-settings"
            />
            {hasPayrollValidationResults && (
              <ErrorEnum count={payrollValidationResultsCount} />
            )}
          </TabItem>
        </Tab>
      )}
    </div>
  );
};
