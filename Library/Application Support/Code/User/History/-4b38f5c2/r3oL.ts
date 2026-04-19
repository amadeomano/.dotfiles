import { getParser, parseWithCompression } from './getParser';

import {
  type ParserBuilder,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsJson,
  parseAsString,
} from 'nuqs-next-router';

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
    const parser = getParser({ foo: 'bar' });
    expect(parser.parse(parser.serialize('{"foo":"bar"}' as never))).toEqual({
      foo: 'bar',
    });
  });

  it('should force JSON parsing when forceParseAsJson is true', () => {
    const parser = getParser('string', true);
    expect(parser.parse(parser.serialize('{"foo":"bar"}' as never))).toEqual({
      foo: 'bar',
    });
  });
});

describe('parseWithCompression', () => {
  it('should compress and decompress string values', () => {
    const stringParser = parseWithCompression(parseAsString);
    const value = 'test string';
    const serialized = stringParser.serialize(value);
    expect(stringParser.parse(serialized)).toBe(value);
  });

  it('should compress and decompress boolean values', () => {
    const boolParser = parseWithCompression(parseAsBoolean);
    const value = true;
    const serialized = boolParser.serialize(value);
    expect(boolParser.parse(serialized)).toBe(value);
  });

  it('should compress and decompress number values', () => {
    const numberParser = parseWithCompression(parseAsFloat);
    const value = 3.14;
    const serialized = numberParser.serialize(value);
    expect(numberParser.parse(serialized)).toBe(value);
  });

  it('should compress and decompress JSON objects', () => {
    const jsonParser = parseWithCompression(parseAsJson());
    const value = { foo: 'bar', num: 42 };
    const serialized = jsonParser.serialize(value);
    expect(jsonParser.parse(serialized)).toEqual(value);
  });

  it('should handle empty values', () => {
    const stringParser = parseWithCompression(parseAsString);
    const value = '';
    const serialized = stringParser.serialize(value);
    expect(stringParser.parse(serialized)).toBe(value);
  });
});
