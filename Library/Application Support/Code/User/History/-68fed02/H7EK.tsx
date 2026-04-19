import { render, screen } from '@testing-library/react';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import mockRouter from 'next-router-mock';
import { parseAsArrayOf, parseAsJson, parseAsString } from 'nuqs-next-router';

// import { useQueryParamState } from '@personio-web/employees-organizations-hook-use-query-param-state';
// import {
//   type PersonAttribute,
//   PersonSystemAttribute,
// } from '@personio-web/employees-organizations-util-people';

import {
  generateOrgChartLink,
  ORG_CHART_URL_BASE,
} from './generateOrgChartLink';
import { type GenerateOrgChartLinkOptions, type OrgChartFilter } from './types';

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

// const MockQueryStateConsumer = () => {
//   const [attributeIds] = useQueryParamState<PersonAttribute[]>({
//     key: 'attributes',
//     // since defaultValue has a JSON array defined, we do not need to use `forceParseAsJson`
//     defaultValue: ['outdated-attribute'],
//   });

//   const [cardPreferences] = useQueryParamState<
//     GenerateOrgChartLinkOptions['cardCustomizationPreferences']
//   >({
//     key: 'cardCustomizationPreferences',
//     defaultValue: {
//       personalInfo: true,
//       avatars: true,
//       cardClustering: true,
//       openPositions: false,
//     },
//   });

//   const [filters] = useQueryParamState<GenerateOrgChartLinkOptions['filters']>({
//     key: 'filters',
//     defaultValue: [],
//     // set to true since the defaultValue of empty array will not
//     // allow us to "detect" the type of the array children
//     forceParseAsJson: true,
//   });

//   const [highlighted] = useQueryParamState<PersonAttribute>({
//     key: 'highlighted',
//     defaultValue: '',
//   });

//   const [spotlight] = useQueryParamState<PersonAttribute>({
//     key: 'spotlight',
//     defaultValue: '',
//   });

//   return (
//     <div>
//       <span data-test-id="parsed-value-attributes">
//         {attributeIds.join(',')}
//       </span>
//       <span data-test-id="parsed-value-cardCustomizationPreferences">
//         {`Cluster Cards: ${cardPreferences.cardClustering} / Personal Info: ${cardPreferences.personalInfo} / Avatars: ${cardPreferences.avatars}`}
//       </span>
//       <span data-test-id="parsed-value-filters">
//         {filters
//           .map((f: GenerateOrgChartLinkOptions['filters'][0]) => f.id)
//           .join(',')}
//       </span>
//       <span data-test-id="parsed-value-highlighted">
//         {`Attribute: ${highlighted}`}
//       </span>
//       <span data-test-id="parsed-value-spotlight">
//         {`Spotlight: ${spotlight}`}
//       </span>
//     </div>
//   );
// };

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
        // PersonSystemAttribute.Department,
        id: 'department_id',
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

  describe('with a consumer of useQueryParamState', () => {
    it('should parse all of the url parameters as expected', () => {
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
      const route = generateOrgChartLink({
        attributes: attributesInput,
        cardCustomizationPreferences: cardPreferencesInput,
        filters: filtersInput,
        highlighted: highlightedInput,
        spotlight: spotlightInput,
      });

      mockRouter.push(route);

      render(<MockQueryStateConsumer />);

      expect(screen.getByTestId('parsed-value-attributes').textContent).toEqual(
        attributesInput[0],
      );

      expect(
        screen.getByTestId(`parsed-value-cardCustomizationPreferences`)
          .textContent,
      ).toEqual(
        `Cluster Cards: ${cardPreferencesInput.cardClustering} / Personal Info: ${cardPreferencesInput.personalInfo} / Avatars: ${cardPreferencesInput.avatars}`,
      );

      expect(screen.getByTestId(`parsed-value-filters`).textContent).toEqual(
        filtersInput[0].id,
      );

      expect(
        screen.getByTestId(`parsed-value-highlighted`).textContent,
      ).toEqual(`Attribute: ${highlightedInput}`);

      expect(screen.getByTestId(`parsed-value-spotlight`).textContent).toEqual(
        `Spotlight: ${spotlightInput}`,
      );
    });
  });
});
