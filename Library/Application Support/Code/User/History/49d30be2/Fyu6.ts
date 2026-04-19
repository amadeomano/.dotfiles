import { sortByDate, sortByStr, sortByNum } from './sortUtils';

describe('sortUtils', () => {
  test('sortByDate sorts correctly', () => {
    // Ascending
    expect(sortByDate('2023-01-01', '2023-01-02')).toBeLessThan(0);
    expect(sortByDate('2023-01-02', '2023-01-01')).toBeGreaterThan(0);
    expect(sortByDate('2023-01-01', '2023-01-01')).toBe(0);
    expect(sortByDate(undefined, '2023-01-01')).toBe(1);
    expect(sortByDate('2023-01-01', undefined)).toBe(-1);
    expect(sortByDate(undefined, undefined)).toBe(0);

    // Descending
    expect(sortByDate('2023-01-01', '2023-01-02', true)).toBeGreaterThan(0);
    expect(sortByDate('2023-01-02', '2023-01-01', true)).toBeLessThan(0);
    expect(sortByDate('2023-01-01', '2023-01-01', true)).toBe(0);
    expect(sortByDate(undefined, '2023-01-01', true)).toBe(1);
    expect(sortByDate('2023-01-01', undefined, true)).toBe(-1);
    expect(sortByDate(undefined, undefined, true)).toBe(0);
  });

  test('sortByStr sorts correctly', () => {
    // Ascending
    expect(sortByStr('apple', 'banana')).toBeLessThan(0);
    expect(sortByStr('banana', 'apple')).toBeGreaterThan(0);
    expect(sortByStr('apple', 'apple')).toBe(0);

    // Descending
    expect(sortByStr('apple', 'banana', true)).toBeGreaterThan(0);
    expect(sortByStr('banana', 'apple', true)).toBeLessThan(0);
    expect(sortByStr('apple', 'apple', true)).toBe(0);
  });

  test('sortByNum sorts correctly', () => {
    // Ascending
    // expect(sortByNum(1, 2)).toBeLessThan(0);
    expect(sortByNum(2, 1)).toBeGreaterThan(0);
    expect(sortByNum(1, 1)).toBe(0);

    // Descending
    expect(sortByNum(1, 2, true)).toBeGreaterThan(0);
    expect(sortByNum(2, 1, true)).toBeLessThan(0);
    expect(sortByNum(1, 1, true)).toBe(0);
  });
});
