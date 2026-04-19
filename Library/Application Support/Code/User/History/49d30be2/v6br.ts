import { sortByDate, sortByStr, sortByNum } from './sortUtils';

describe('sortUtils', () => {
  test('sortByDate sorts correctly', () => {
    expect(sortByDate('2023-01-01', '2023-01-02')).toBeLessThan(0);
    expect(sortByDate('2023-01-02', '2023-01-01')).toBeGreaterThan(0);
    expect(sortByDate('2023-01-01', '2023-01-01')).toBe(0);
    expect(sortByDate(undefined, '2023-01-01')).toBe(1);
    expect(sortByDate('2023-01-01', undefined)).toBe(-1);
    expect(sortByDate(undefined, undefined)).toBe(0);
  });

  test('sortByStr sorts correctly', () => {
    expect(sortByStr('apple', 'banana')).toBeLessThan(0);
    expect(sortByStr('banana', 'apple')).toBeGreaterThan(0);
    expect(sortByStr('apple', 'apple')).toBe(0);
  });

  test('sortByNum sorts correctly', () => {
    expect(sortByNum(1, 2)).toBeLessThan(0);
    expect(sortByNum(2, 1)).toBeGreaterThan(0);
    expect(sortByNum(1, 1)).toBe(0);
  });
});
