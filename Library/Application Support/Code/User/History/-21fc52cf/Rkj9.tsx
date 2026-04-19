import React, { useState } from 'react';

import { Alert } from '@highlight-ui/alert';
import { Checkbox } from '@highlight-ui/checkbox';
import { DatePicker } from '@highlight-ui/date-time-picker';
import { Dialog } from '@highlight-ui/dialog';
import { FormField } from '@highlight-ui/form-field';
import { toaster } from '@highlight-ui/toast';
import { Body } from '@highlight-ui/typography';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';

import { Inline, Stack } from 'designSystem/component/layout';
import { Translate } from '@personio-web/translate-component';
import {
  type PeopleListExtendedLinkInfoProps,
  useGeneratePeopleListExtendedLink,
} from 'employeesOrganizations/hook/generate-people-list-link';
import { InlineAlert } from 'designSystem/component/inline-alert';
import { icons } from 'designSystem/component/icon';
import { Link } from 'designSystem/component/link';
import { TEST_IDS } from '../../../../../config/tests/test-ids';
import { ServerErrorReason } from '../../../../../shared/components/attributes-form/hooks/useHandleAttributeServerErrors/useHandleAttributeServerErrors.types';
import {
  useDialogContext,
  useSelectedPermanentEstablishmentContext,
} from '../../../../../shared/context';
import {
  formatDate,
  notifyFilteredServerErrorsByToast,
} from '../../../../../shared/helpers';
import {
  useEditPermanentEstablishment,
  useGetServerErrors,
  useT,
} from '../../../../../shared/hooks';
import { mapPEToStatusUpdatePayload } from '../helpers/mapPEToStatusUpdatePayload';
import styles from './OutOfBusinessDialog.module.scss';

export const OutOfBusinessDialog: React.FC<
  React.PropsWithChildren<unknown>
> = () => {
  const t = useT();
  const { dialog, setDialog } = useDialogContext();
  const { isOn, isReady } = useFeatureFlag('ORGM-2775-schedule-pe-oob');
  const isSchedulePEOutOfBusinessEnabled = isOn && isReady;

  const [confirmationCheckbox, setConfirmationCheckbox] =
    useState<boolean>(false);
  const { editPermanentEstablishment, isLoading } =
    useEditPermanentEstablishment();
  const { getServerErrors } = useGetServerErrors();

  const { selectedPermanentEstablishment } =
    useSelectedPermanentEstablishmentContext();

  const tomorrow = addDays(new Date(), 1);
  const maxDate = isSchedulePEOutOfBusinessEnabled
    ? addMonths(tomorrow, 3)
    : new Date();

  const minDate =
    isSchedulePEOutOfBusinessEnabled &&
    Boolean(selectedPermanentEstablishment?.activeEmployeeCount)
      ? tomorrow
      : undefined;

  const [validFrom, setValidFrom] = useState<Date | undefined>(
    isSchedulePEOutOfBusinessEnabled &&
      Boolean(selectedPermanentEstablishment?.activeEmployeeCount)
      ? tomorrow
      : new Date(),
  );

  const handleOnClose = () => {
    setDialog({ name: undefined });
  };

  const handleOnSubmit = () => {
    if (
      !(selectedPermanentEstablishment && validFrom && confirmationCheckbox)
    ) {
      return;
    }

    editPermanentEstablishment(
      {
        id: selectedPermanentEstablishment.id,
        data: {
          entity: mapPEToStatusUpdatePayload(
            selectedPermanentEstablishment,
            'OUT_OF_BUSINESS',
          ),
          updatedFields: ['status'],
          validFrom: formatDate(validFrom),
        },
      },
      {
        onSuccess: () => {
          toaster.notify({
            theme: 'success',
            children: t('out-of-business.success-toast'),
          });

          handleOnClose();
        },
        onError: (error) => {
          const serverErrors = getServerErrors(error);

          const mappedServerErrors = {
            [ServerErrorReason.STATUS_TRANSITION_INVALID_DUE_ACTIVE_EMPLOYEES]:
              t('toast-messages.entity-oob-employees-assigned'),
            [ServerErrorReason.STATUS_TRANSITION_INVALID_DUE_SCHEDULED_EMPLOYEES]:
              t('toast-messages.entity-oob-employees-scheduled'),
            [ServerErrorReason.STATUS_TRANSITION_INVALID_DUE_NON_TERMINATED_EMPLOYEES]:
              t('toast-messages.schedule-status-change-error'),
          };

          notifyFilteredServerErrorsByToast(serverErrors, mappedServerErrors);
        },
      },
    );
  };

  const columns = ['permanent_establishment_id, status, termination_date'];
  const filters: PeopleListExtendedLinkInfoProps['filters'] = [
    {
      id: 'permanent_establishment_id',
      value: {
        condition: 'contains',
        value: [String(selectedPermanentEstablishment?.id)],
      },
    },
    {
      id: 'status',
      value: {
        condition: 'contains',
        value: ['active'],
      },
    },
  ];

  const peopleListLink = useGeneratePeopleListExtendedLink({
    columns,
    filters,
  });

  const saveButtonState =
    validFrom && confirmationCheckbox ? 'default' : 'disabled';

  return (
    <Dialog
      onRequestToClose={handleOnClose}
      open={dialog.name === 'outOfBusiness'}
      primaryButton={{
        buttonLabel: t('out-of-business.dialog.primary-button-label'),
        onClick: handleOnSubmit,
        buttonState: isLoading ? 'loading' : saveButtonState,
      }}
      secondaryButtons={[
        {
          buttonLabel: t('cancel'),
          onClick: handleOnClose,
        },
      ]}
      size="medium"
      title={t('out-of-business.dialog.title')}
      variant="destructive"
    >
      <Alert iconSize={12} status="highlight">
        {t('out-of-business.dialog.alert')}
      </Alert>
      <div className={styles.description}>
        <Body color="text-default" variant="base">
          {t('out-of-business.dialog.description')}
        </Body>
      </div>
      <div>
        {Boolean(selectedPermanentEstablishment?.activeEmployeeCount) &&
          isSchedulePEOutOfBusinessEnabled && (
            <Stack className={styles.warningMessage}>
              <InlineAlert
                roleAlert
                icon={icons.exclamationMarkTriangleFilled}
                sentiment="warning"
                message={
                  <Stack space="gap-default">
                    <Body>
                      {t('out-of-business.reassign-dialog.warning-body')}
                    </Body>
                    <Inline space="gap-small">
                      <Body>
                        <Translate
                          namespace="permanent-establishments-settings"
                          i18nKey="out-of-business.reassign-dialog.info"
                          values={{
                            activeEmployeeCount:
                              selectedPermanentEstablishment?.activeEmployeeCount,
                            permanentEstablishmentName:
                              selectedPermanentEstablishment?.name,
                          }}
                        />
                      </Body>
                      <Body>
                        <Link
                          unstyled
                          className={styles.link}
                          href={peopleListLink}
                          target="_blank"
                        >
                          {t(
                            'out-of-business.reassign-dialog.primary-button-label',
                          )}
                        </Link>
                      </Body>
                    </Inline>
                  </Stack>
                }
              />
            </Stack>
          )}

        <FormField
          className={styles.closingDatePicker}
          label={t('out-of-business.dialog.closing-date')}
        >
          <DatePicker
            autoFocus={false}
            minDate={minDate}
            maxDate={maxDate}
            onChange={setValidFrom}
            outline={validFrom === undefined ? 'error' : 'default'}
            value={validFrom}
          />
        </FormField>
        <div className={styles.description}>
          <Body color="text-subdued" variant="base">
            {t('out-of-business.dialog.description2')}
          </Body>
        </div>
        <Checkbox
          checked={confirmationCheckbox}
          className={styles.confirmationCheckbox}
          label={t('out-of-business.dialog.confirmation-label')}
          metadata={{
            testId: TEST_IDS.OUT_OF_BUSINESS.DIALOG_CONFIRM_CHECKBOX,
          }}
          onChange={() => {
            setConfirmationCheckbox(
              (prevConfirmationCheckbox) => !prevConfirmationCheckbox,
            );
          }}
        />
      </div>
    </Dialog>
  );
};
