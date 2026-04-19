import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import DatePicker from 'react-datepicker';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import classnames from 'classnames';
import isValid from 'date-fns/isValid';

import { CalendarProps } from '@personio-web/design-system-component-calendar';
import type { Shortcut } from '@personio-web/design-system-component-calendar-types';
import { Icon } from '@personio-web/design-system-component-icon';
import { CalendarIcon } from '@personio-web/design-system-component-icon/icons/Calendar';
import { Input } from '@personio-web/design-system-component-input';

import { monthDateFormat, yearDateFormat } from '../../common/constants';
import {
  convertLocale,
  defaultDateFormat,
  getFormattedDate,
} from '../../common/utils';
import { CustomHeader } from '../Header/CustomHeader/CustomHeader';
import { Navigation } from '../Header/Navigation/Navigation';
import { ShortcutContainer } from '../ShortcutsContainer/ShortcutsContainer';

import styles from '../../Calendar.module.scss';
import commonStyles from '../../common/styles/styles.module.scss';

const SingleCalendar = ({
  id,
  ariaDescribedBy,
  date,
  conditions = [],
  selectedCondition = conditions[0],
  conditionsLabel,
  className,
  fullWidth,
  locale = 'en-US',
  title,
  minDate,
  maxDate,
  open,
  openToDate,
  actions,
  previousLabel,
  nextLabel,
  showInput = true,
  onChange,
  onClickOutside,
  excludeDates,
  metadata,
  autoFocus = false,
  inputSize = 'default',
  inputIconVisible = true,
  variant = 'day',
  hasError = false,
  placeholder,
  disabled,
  isInput,
  defaultDateShortcuts,
  customShortcuts,
  showDefaultOnTop,
}: CalendarProps) => {
  const { t } = useTranslation('design-system');
  const calendarPortal = useMemo(
    () =>
      ({ children }: { children: React.ReactNode }) =>
        createPortal(<div>{children}</div>, document.body),
    [],
  );

  const convertedLocale = convertLocale(locale);

  const singleDateInputRef = useRef<HTMLInputElement>(null);

  const isMonth = variant === 'month';
  const isYear = variant === 'year';
  const yearItemNumber = isYear ? 10 : undefined;

  const validateDate = useCallback(
    (date: Date | null | undefined): Date | null | undefined => {
      if (!date) return date;
      if (minDate && date < minDate) return minDate;
      if (maxDate && date > maxDate) return maxDate;
      return date;
    },
    [maxDate, minDate],
  );

  const validatedDate = validateDate(date);

  const [inputValue, setInputValue] = useState('');
  useEffect(() => {
    if (validatedDate) {
      setInputValue(
        getFormattedDate({
          date: validatedDate,
          locale: convertedLocale,
          dateFormat: defaultDateFormat,
        }),
      );
    } else {
      setInputValue('');
    }
  }, [validatedDate, convertedLocale]);

  const dateFormat = useMemo(() => {
    if (isMonth) return monthDateFormat;
    if (isYear) return yearDateFormat;
    return defaultDateFormat;
  }, [isMonth, isYear]);

  const handleDateChange = (date: Date | null | undefined) => {
    if (onChange) {
      onChange({
        date: validateDate(date) ?? undefined,
        ...(conditions.length && { condition: selectedCondition }),
      });
    }
  };

  const handlShortCutDateChange = (
    date: Date | null | undefined,
    shortcutId?: Shortcut['id'],
  ) => {
    if (onChange) {
      onChange({
        date: validateDate(date) ?? undefined,
        ...(conditions.length && { condition: selectedCondition }),
        shortcutId,
      });
    }
  };

  const handleConditionChange = (value: string) => {
    if (onChange) {
      onChange({
        date: validatedDate || undefined,
        condition: value,
      });
    }
  };

  const handleDateInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleDateInputOnKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    const updatedDate = new Date(target.value);

    if (e.key === 'Enter') {
      e.preventDefault();

      if (!isValid(updatedDate)) {
        const today = new Date();
        handleDateChange(today);
        setInputValue(
          getFormattedDate({
            date: today,
            locale: convertedLocale,
            dateFormat: defaultDateFormat,
          }),
        );
      } else {
        handleDateChange(updatedDate);
      }
    }
  };

  const renderCalendarContainer = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <ShortcutContainer
      defaultDateShortcuts={defaultDateShortcuts}
      showDefaultOnTop={showDefaultOnTop}
      customShortcuts={customShortcuts}
      dateOnChange={handlShortCutDateChange}
      locale={locale}
    >
      {children}
    </ShortcutContainer>
  );

  return (
    <DatePicker
      id={id}
      ariaDescribedBy={ariaDescribedBy}
      inline={!isInput}
      shouldCloseOnSelect={showInput}
      focusSelectedMonth
      calendarClassName={classnames(styles.calendar, className, {
        [styles.year]: isYear,
      })}
      selected={validatedDate}
      minDate={minDate}
      maxDate={maxDate}
      open={open}
      openToDate={openToDate}
      onClickOutside={onClickOutside}
      onChange={handleDateChange}
      excludeDates={excludeDates}
      renderCustomHeader={(props) => (
        <>
          {isInput ? (
            ''
          ) : (
            <CustomHeader
              {...props}
              isMonth={isMonth}
              isYear={isYear}
              title={title}
              conditions={conditions}
              conditionsLabel={conditionsLabel}
              selectedCondition={selectedCondition}
              handleConditionChange={handleConditionChange}
              actions={actions}
              previousLabel={previousLabel}
              nextLabel={nextLabel}
              metadata={metadata}
              locale={convertedLocale}
              dateFormat={dateFormat}
              showInput={showInput}
              isInput={false}
              range={false}
              autoFocus={autoFocus}
              inputRefs={{
                singleDateInputRef,
                startDateRangeInputRef: null,
                endDateRangeInputRef: null,
              }}
              inputValues={{
                selectedDate: inputValue,
              }}
              handleDateInputOnChange={handleDateInputOnChange}
              handleDateInputOnKeyDown={handleDateInputOnKeyDown}
            />
          )}
          <Navigation
            {...props}
            isMonth={isMonth}
            isYear={isYear}
            previousLabel={previousLabel}
            nextLabel={nextLabel}
            metadata={metadata}
            locale={convertedLocale}
          />
        </>
      )}
      locale={convertedLocale}
      fixedHeight
      dateFormat={dateFormat}
      showMonthYearPicker={isMonth}
      showFullMonthYearPicker={isMonth}
      showYearPicker={isYear}
      yearItemNumber={yearItemNumber}
      popperClassName={commonStyles.popper}
      showPopperArrow={false}
      popperContainer={calendarPortal}
      popperPlacement="bottom-start"
      placeholderText={placeholder ?? t('calendar.input.placeholder')}
      disabled={disabled}
      customInput={
        isInput ? (
          <Input
            hasError={hasError}
            className={classnames('react-datepicker-ignore-onclickoutside', {
              [styles.fullWidth]: fullWidth,
              [styles.inputStyle]: !fullWidth,
            })}
            suffix={
              inputIconVisible ? (
                <Icon icon={CalendarIcon} color="tertiary" />
              ) : undefined
            }
            size={inputSize}
            ref={singleDateInputRef}
            value={inputValue}
            onChange={handleDateInputOnChange}
            onKeyDown={handleDateInputOnKeyDown}
          />
        ) : undefined
      }
      calendarContainer={
        defaultDateShortcuts || (customShortcuts && customShortcuts.length > 0)
          ? renderCalendarContainer
          : undefined
      }
    />
  );
};

export { SingleCalendar };
