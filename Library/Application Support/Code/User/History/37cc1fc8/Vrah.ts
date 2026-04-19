import type { StringCondition, NumericCondition } from './filterUtils';
import { predicateByStr, predicateByNum } from './filterUtils';

describe('predicateByStr', () => {
  const supportedConditionsTable: [StringCondition, string, string, boolean][] =
    [
      ['contains', 'foo bar', 'bar', true],
      ['contains', 'foo bar', 'baz', false],
      // And any other unimplemented conditions
      ['does_not_contain', '', '', false],
    ];
  it.each(supportedConditionsTable)(
    'should check "%s" on "%s" against "%s" and result in %s',
    (condition, source, value, result) =>
      expect(predicateByStr(source, { value, condition })).toBe(result),
  );
});

describe('predicateByNum', () => {
  const supportedConditionsTable: [
    NumericCondition,
    number,
    number,
    boolean,
  ][] = [
    ['contains', 'foo bar', 'bar', true],
    ['contains', 'foo bar', 'baz', false],
    // And any other unimplemented conditions
    ['does_not_contain', '', '', false],
  ];
  it.each(supportedConditionsTable)(
    'should check "%s" on "%s" against "%s" and result in %s',
    (condition, source, value, result) =>
      expect(predicateByStr(source, { value, condition })).toBe(result),
  );
});

describe('predicateByNum', () => {
  it('should return false when condition is unknown', () => {
    expect(predicateByNum(5, { value: 5, condition: 'something' })).toBe(false);
  });

  it('should return true when source equals value', () => {
    expect(predicateByNum(5, { value: 5, condition: 'equals' })).toBe(true);
  });

  it('should return true when source is greater than or equal to value', () => {
    expect(
      predicateByNum(5, { value: 3, condition: 'is_greater_than_or_equal' }),
    ).toBe(true);
  });

  it('should return true when source is less than or equal to value', () => {
    expect(
      predicateByNum(2, { value: 3, condition: 'is_less_than_or_equal' }),
    ).toBe(true);
  });

  it('should return true when source is within range', () => {
    expect(
      predicateByNum(5, { value: [3, 7], condition: 'is_within_range' }),
    ).toBe(true);
  });

  it('should return false for unmatched conditions', () => {
    expect(predicateByNum(5, { value: 10, condition: 'equals' })).toBe(false);
  });
});
