import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { EmployeePicker } from '@personio-web/employees-organizations-feature-employee-picker';
import { IconButton } from 'designSystem/component/button';
import { icons } from 'designSystem/component/icon';
import { Label } from 'designSystem/component/label';
import { Inline, Stack } from 'designSystem/component/layout';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import OrgUnitsLeadsPromoTag from '../org-units-leads-promo-tag';
import { toTranslate } from '../../org-unit-details/toTranslate';
import styles from './OrgUnitsLeadsPicker.module.scss';

type Props = {
  values: string[];
  onChange: (value: string[]) => void;
};

const MAX_ALLOWED_LEADS = 3;

const OrgUnitsLeadsPicker = ({ values, onChange }: Props) => {
  const { t } = useTranslation('org-units');

  const leadsPromoTagFlag = useFeatureFlag(FeatureFlags.ENABLE_LEADS_PROMO_TAG);
  const isLeadsPromoTagEnabled =
    leadsPromoTagFlag.isReady && leadsPromoTagFlag.isOn;

  const pickerSlots = useMemo(() => {
    const shouldShowEmptySlot = values.length < MAX_ALLOWED_LEADS;
    return values.length + (shouldShowEmptySlot ? 1 : 0);
  }, [values.length]);

  const handlePickerChange = useCallback(
    (index: number, value: string) => {
      const newValues = [...values];

      if (value) {
        newValues[index] = value;
      } else {
        newValues.splice(index, 1);
      }

      onChange(newValues);
    },
    [values, onChange],
  );

  const handleRemoveLead = useCallback(
    (index: number) => {
      onChange(values.filter((_, i) => i !== index));
    },
    [values, onChange],
  );

  const getDisabledIds = useCallback(
    (currentIndex: number) => values.filter((_, i) => i !== currentIndex),
    [values],
  );

  const isRemoveDisabled = useCallback(
    (index: number) => {
      const hasValue = Boolean(values[index]);
      const isEmptySlot = index === values.length;
      return !hasValue || isEmptySlot;
    },
    [values],
  );

  return (
    <Stack space="gap-default" metadata={{ testId: 'org-units-leads-picker' }}>
      <Inline alignVertical="center" space="gap-default">
        <Label
          title={t('leads.title', { defaultValue: toTranslate.leads.title })}
        />
        {isLeadsPromoTagEnabled && <OrgUnitsLeadsPromoTag />}
      </Inline>
      <p className={styles.subTitle}>
        {t('leads.subtitle', {
          maxAllowedLeads: MAX_ALLOWED_LEADS,
          defaultValue: toTranslate.leads.subtitle,
        })}
      </p>

      {Array.from({ length: pickerSlots }, (_, index) => {
        const currentValue = values[index] || '';

        return (
          <Inline space="gap-default" key={`${index}-${currentValue}`}>
            <div className={styles.pickerContainer}>
              <EmployeePicker
                hideSelectAll
                disabledIds={getDisabledIds(index)}
                size="fullWidth"
                placeholder={t('leads.placeholder', {
                  defaultValue: toTranslate.leads.placeholder,
                })}
                value={currentValue}
                onChange={(value) => handlePickerChange(index, value)}
                triggerType="search"
                side="top"
                allowedStatuses={['ACTIVE']}
              />
            </div>

            <IconButton
              icon={icons.trash}
              variant="ghost"
              disabled={isRemoveDisabled(index)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveLead(index);
              }}
              aria-label={t('leads.remove', {
                index: index + 1,
                defaultValue: toTranslate.leads.remove,
              })}
            />
          </Inline>
        );
      })}
    </Stack>
  );
};

export default OrgUnitsLeadsPicker;
