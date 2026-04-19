import { parseAsString } from 'nuqs-next-router';

import { getParser, parseWithCompression } from './getParser';

describe('getParser', () => {
  it('should return string parser for undefined input', () => {
    const parser = getParser(undefined);
    expect(parser.parse(parser.serialize('test' as never))).toBe('test');
  });

  it('should return boolean parser for boolean input', () => {
    const parser = getParser(false);
    expect(parser.parse(parser.serialize('true' as never))).toBe(true);
  });

  it('should return integer parser for integer input', () => {
    const parser = getParser(1);
    expect(parser.parse(parser.serialize('42' as never))).toBe(42);
  });

  it('should return float parser for float input', () => {
    const parser = getParser(1.5);
    expect(parser.parse(parser.serialize('3.14' as never))).toBe(3.14);
  });

  it('should return array parser for array input', () => {
    const parser = getParser([1]);
    const compressedArray = parser.serialize([1, 2, 3] as never);
    expect(compressedArray).toBeString();
    expect(parser.parse(compressedArray)).toEqual([1, 2, 3]);
  });

  it('should return JSON parser for object input', () => {
    const parser = getParser({});
    const compressedObj = parser.serialize({ foo: 'bar' } as never);
    expect(compressedObj).toBeString();
    expect(parser.parse(compressedObj)).toEqual({
      foo: 'bar',
    });
  });

  it('should force JSON parsing when forceParseAsJson is true', () => {
    const parser = getParser('string', true);
    const compressedObj = parser.serialize({ foo: 'bar' } as never);
    expect(compressedObj).toBeString();
    expect(parser.parse(compressedObj)).toEqual({
      foo: 'bar',
    });
  });
});

describe('parseWithCompression', () => {
  it('should compress and decompress using parseAsString', () => {
    const stringParser = parseWithCompression(parseAsString);
    const value = 'test string';
    const serialized = stringParser.serialize(value as never);
    expect(stringParser.parse(serialized)).toBe(value);
  });

  it('should handle empty values', () => {
    const stringParser = parseWithCompression(parseAsString);
    const value = '';
    const serialized = stringParser.serialize(value as never);
    expect(stringParser.parse(serialized)).toBe(value);
  });
});
