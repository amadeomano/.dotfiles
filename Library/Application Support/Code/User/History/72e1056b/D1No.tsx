import React from 'react';
import { FieldPath } from 'react-hook-form';
import { icons } from 'designSystem/component/icon';
import { Select } from 'designSystem/component/select';
import { Tooltip, TooltipProps } from 'designSystem/component/tooltip';
import { ControlledSelect } from '@personio-web/payroll-component-controlled-select';
import type { PayrollIntegrationCalendar } from '@personio-web/payroll-data-payroll-integration-context';

import { XeroSettingsForm } from '../../XeroSettingsForm';
import { useTranslation } from 'react-i18next';
import { TRANSLATION_NAMESPACE } from '../../constants';

const useRequiredFieldRule = (fieldIsDisabled?: boolean) => {
  return {
    required: {
      value: !fieldIsDisabled,
      message: 'This field is required',
    },
  };
};

type SelectPayPeriodsProps = {
  calendars: PayrollIntegrationCalendar[];
  name: FieldPath<XeroSettingsForm>;
  disabled?: boolean;
  disabledTooltip?: string;
};
export const SelectPayPeriod: React.FC<
  React.PropsWithChildren<SelectPayPeriodsProps>
> = ({ calendars, name, disabled, disabledTooltip }) => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'xero.manage',
  });
  const requiredFieldRule = useRequiredFieldRule(disabled);

  return (
    <DisabledButtonTooltipWrapper
      tooltip={disabled ? disabledTooltip : ''}
      side="left"
    >
      <ControlledSelect<XeroSettingsForm>
        name={name}
        disabled={disabled}
        key={name}
        contentClassName="restyle-dialog"
        rules={requiredFieldRule}
      >
        <Select.TriggerValue placeholder={t('pay-periods.select-trigger')} />
        <Select.Viewport>
          {calendars.map((calendar) => (
            <Select.Item
              key={calendar.id}
              value={calendar.id}
              icon={icons.calendar}
              disabled={calendar.frequency === 'weekly'}
            >
              {calendar.name}
            </Select.Item>
          ))}
        </Select.Viewport>
      </ControlledSelect>
    </DisabledButtonTooltipWrapper>
  );
};

const DisabledButtonTooltipWrapper: React.FC<
  React.PropsWithChildren<{
    tooltip?: string;
    side?: TooltipProps['side'];
    children: JSX.Element;
  }>
> = ({ tooltip, side, children }): JSX.Element => {
  if (tooltip) {
    return (
      <Tooltip side={side} content={tooltip}>
        <span tabIndex={0} style={{ cursor: 'not-allowed' }}>
          {children}
        </span>
      </Tooltip>
    );
  }

  return children;
};
