import {
  type ParserBuilder,
  createParser,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsFloat,
  parseAsInteger,
  parseAsJson,
  parseAsString,
} from 'nuqs-next-router';

import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

export type NuqsParser<T> =
  | ParserBuilder<boolean>
  | ParserBuilder<number>
  | ParserBuilder<string>
  | ParserBuilder<T>
  | ParserBuilder<unknown[]>;

export const parseWithCompression = <T>(
  internalParser: NuqsParser<T>,
): NuqsParser<T> =>
  createParser({
    parse: (queryValue) => {
      const decompressed = decompressFromEncodedURIComponent(queryValue);
      return (internalParser as ParserBuilder<T>).parse(decompressed);
    },
    serialize: (value) => {
      return compressToEncodedURIComponent(
        (internalParser as ParserBuilder<T>).serialize(value),
      );
    },
  });

export const getParser = <T>(
  stateToParse?: T,
  forceParseAsJson?: boolean,
): NuqsParser<T> => {
  return parseWithCompression(getNuqsParser(stateToParse, forceParseAsJson));
};

const getNuqsParser = <T>(
  stateToParse?: T,
  forceParseAsJson?: boolean,
): NuqsParser<T> => {
  const type = forceParseAsJson ? 'object' : typeof stateToParse;

  switch (type) {
    case 'boolean':
      return parseAsBoolean;
    case 'number':
      return !isNaN(stateToParse as number) && Number.isInteger(stateToParse)
        ? parseAsInteger
        : parseAsFloat;
    case 'object': {
      const isArray = Array.isArray(stateToParse);
      if (isArray) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- type will be determined recursively
        const arrayItem = (stateToParse as any[])[0];
        const parser = getNuqsParser(arrayItem, forceParseAsJson);
        return parseAsArrayOf(parser as ParserBuilder<unknown>);
      } else {
        // NOTE: When parsing as JSON is required, defaultValue is
        // needed in order to determine the type
        return parseAsJson() as ParserBuilder<T>;
      }
    }
    default:
      console.log('[] returning string parser', type);
      return parseAsString;
  }
};
