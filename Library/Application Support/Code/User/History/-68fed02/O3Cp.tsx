import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import { parseAsArrayOf, parseAsJson, parseAsString } from 'nuqs-next-router';

import {
  generateOrgChartLink,
  ORG_CHART_URL_BASE,
} from './generateOrgChartLink';
import {
  PersonSystemAttribute,
  type PersonAttribute,
  type GenerateOrgChartLinkOptions,
  type OrgChartFilter,
} from './types';

jest.mock('next/router', () => require('next-router-mock'));

const compress = (input: string) => compressToEncodedURIComponent(input);
const decompress = (input: string) => decompressFromEncodedURIComponent(input);

// utility methods lifted from nuqs to assist in asserting
// these methods are internal to the serializer used in code
const renderQueryString = (search: URLSearchParams) => {
  if (search.size === 0) {
    return '';
  }
  const query: string[] = [];
  for (const [key, value] of search.entries()) {
    // Replace disallowed characters in keys,
    // see https://github.com/47ng/nuqs/issues/599
    const safeKey = key
      .replace(/#/g, '%23')
      .replace(/&/g, '%26')
      .replace(/\+/g, '%2B')
      .replace(/=/g, '%3D')
      .replace(/\?/g, '%3F');
    query.push(`${safeKey}=${encodeQueryValue(value)}`);
  }
  return '?' + query.join('&');
};

const encodeQueryValue = (input: string) => {
  return (
    input
      // Encode existing % signs first to avoid appearing
      // as an incomplete escape sequence:
      .replace(/%/g, '%25')
      // Note: spaces are encoded as + in RFC 3986,
      // so we pre-encode existing + signs to avoid confusion
      // before converting spaces to + signs.
      .replace(/\+/g, '%2B')
      .replace(/ /g, '+')
      // Encode other URI-reserved characters
      .replace(/#/g, '%23')
      .replace(/&/g, '%26')
      // Encode characters that break URL detection on some platforms
      // and would drop the tail end of the querystring:
      .replace(/"/g, '%22')
      .replace(/'/g, '%27')
      .replace(/`/g, '%60')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
  );
};

describe('generateOrgChartLink', () => {
  it('should generate a link with card preferences', () => {
    const input = {
      cardClustering: false,
      personalInfo: true,
      avatars: true,
      openPositions: false,
    };
    const expectedParams = new URLSearchParams({
      cardCustomizationPreferences: compress(parseAsJson().serialize(input)),
    });
    expect(
      generateOrgChartLink({
        cardCustomizationPreferences: input,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should generate a link with card filters', () => {
    const input: OrgChartFilter[] = [
      {
        id: PersonSystemAttribute.Department,
        value: {
          value: ['is-awesome'],
          condition: 'contains',
        },
      },
    ];
    const expectedParams = new URLSearchParams({
      filters: compress(
        parseAsArrayOf<GenerateOrgChartLinkOptions['filters'][0]>(
          parseAsJson(),
        ).serialize(input),
      ),
    });
    expect(
      generateOrgChartLink({
        filters: input,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should generate a link with highlighted', () => {
    const input = PersonSystemAttribute.Department;
    const expectedParams = new URLSearchParams({
      highlighted: compress(parseAsString.serialize(input)),
    });
    expect(
      generateOrgChartLink({
        highlighted: input,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should generate a link with spotlight', () => {
    const input = 'my-employee';
    const expectedParams = new URLSearchParams({
      spotlight: compress(parseAsString.serialize(input)),
    });
    expect(
      generateOrgChartLink({
        spotlight: input,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should generate a link with attributes as strings', () => {
    const input = ['my-attribute'];
    const expectedParams = new URLSearchParams({
      attributes: compress(
        parseAsArrayOf<string>(parseAsString).serialize(input),
      ),
    });
    expect(
      generateOrgChartLink({
        attributes: input,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should generate a link with an array of attributes', () => {
    const input = ['my-attribute', 'my-attribute-2'];
    const expectedParams = new URLSearchParams({
      attributes: compress(
        parseAsArrayOf<PersonAttribute>(parseAsString).serialize(input),
      ),
    });
    expect(
      generateOrgChartLink({
        attributes: input,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should properly generate a url with all properties', () => {
    const cardPreferencesInput = {
      cardClustering: false,
      personalInfo: true,
      avatars: true,
      openPositions: false,
    };
    const filtersInput: OrgChartFilter[] = [
      {
        id: PersonSystemAttribute.Department,
        value: {
          value: ['is-awesome'],
          condition: 'contains',
        },
      },
    ];
    const highlightedInput = PersonSystemAttribute.Department;
    const spotlightInput = 'my-employee';
    const attributesInput = ['my-attribute'];
    const expectedParams = new URLSearchParams({
      attributes: compress(
        parseAsArrayOf<PersonAttribute>(parseAsString).serialize(
          attributesInput,
        ),
      ),
      cardCustomizationPreferences: compress(
        parseAsJson().serialize(cardPreferencesInput),
      ),
      filters: compress(
        parseAsArrayOf<GenerateOrgChartLinkOptions['filters'][0]>(
          parseAsJson(),
        ).serialize(filtersInput),
      ),
      highlighted: compress(parseAsString.serialize(highlightedInput)),
      spotlight: compress(parseAsString.serialize(spotlightInput)),
    });
    expect(
      generateOrgChartLink({
        attributes: attributesInput,
        cardCustomizationPreferences: cardPreferencesInput,
        filters: filtersInput,
        highlighted: highlightedInput,
        spotlight: spotlightInput,
      }),
    ).toBe(`${ORG_CHART_URL_BASE}${renderQueryString(expectedParams)}`);
  });

  it('should properly decode compressed, stringified JSON', () => {
    const input = {
      cardClustering: false,
      personalInfo: true,
      avatars: true,
    };
    const expectedParams = new URLSearchParams({
      cardPreferences: compress(parseAsJson().serialize(input)),
    });
    // ensure nuqs query string rendering does not affect the compression parser
    const generatedString = renderQueryString(expectedParams);
    const urlParams = new URLSearchParams(generatedString);

    expect(
      JSON.parse(decompress(urlParams.get('cardPreferences') || '')),
    ).toEqual(input);
  });
});
