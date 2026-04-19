import type {
  StringCondition,
  NumericCondition,
  DateCondition,
} from './filterUtils';
import {
  predicateByStr,
  predicateByNum,
  predicateByDate,
  predicateBySelect,
} from './filterUtils';

describe('predicateByStr', () => {
  const supportedConditionsTable: [StringCondition, string, string, boolean][] =
    [
      ['contains', 'foo bar', 'bar', true],
      ['contains', 'foo bar', 'baz', false],
      // And any other unimplemented conditions
      ['does_not_contain', '', '', false],
    ];
  it.each(supportedConditionsTable)(
    'should string check "%s" on "%s" against "%s" and result in %s',
    (condition, source, value, result) =>
      expect(predicateByStr(source, { value, condition })).toBe(result),
  );
});

describe('predicateByNum', () => {
  const supportedConditionsTable: [
    NumericCondition,
    number,
    number | [number, number],
    boolean,
  ][] = [
    ['equals', 5, 5, true],
    ['is_greater_than_or_equal', 5, 3, true],
    ['is_less_than_or_equal', 2, 3, true],
    ['is_within_range', 5, [3, 7], true],
    // And any other unimplemented conditions
    ['is_greater_than', 5, 3, false],
  ];
  it.each(supportedConditionsTable)(
    'should numeric check "%s" on "%s" against "%s" and result in %s',
    (condition, source, value, result) =>
      expect(predicateByNum(source, { value, condition })).toBe(result),
  );
});

describe('predicateByDate', () => {
  const supportedConditionsTable: [DateCondition, string, Date, boolean][] = [
    ['is_on', '2024-09-27', new Date('2024-09-27'), true],
    // And any other unimplemented conditions
    ['is_on_or_after', '2024-09-27', new Date('2024-09-27'), false],
  ];
  it.each(supportedConditionsTable)(
    'should date check "%s" on "%s" against "%s" and result in %s',
    (condition, source, value, result) =>
      expect(predicateByDate(source, { value, condition })).toBe(result),
  );
});

describe('predicateBySelect', () => {
  const supportedConditionsTable: [DateCondition, string, Date, boolean][] = [
    ['is_on', '2024-09-27', new Date('2024-09-27'), true],
    // And any other unimplemented conditions
    ['is_on_or_after', '2024-09-27', new Date('2024-09-27'), false],
  ];
  it.each(supportedConditionsTable)(
    'should date check "%s" on "%s" against "%s" and result in %s',
    (condition, source, value, result) =>
      expect(predicateByDate(source, { value, condition })).toBe(result),
  );
});
