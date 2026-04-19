import { inspect } from 'util';
import {
  createSerializer,
  parseAsArrayOf,
  parseAsJson,
  parseAsString,
  type ParserBuilder,
} from 'nuqs-next-router';

import { type GenerateOrgChartLinkOptions } from './types';
import { parseWithCompression } from './getParser';

export const ORG_CHART_URL_BASE = '/organization/org-chart';

export const generateOrgChartLink = (
  options: Partial<GenerateOrgChartLinkOptions>,
): string => {
  console.log('[] generate', inspect(options.filters?.[0]));
  const defaultParams: Record<
    keyof GenerateOrgChartLinkOptions,
    ParserBuilder<any>
  > = {
    attributes: parseAsArrayOf(parseAsString),
    cardCustomizationPreferences: parseAsJson(),
    filters: parseAsArrayOf(parseAsJson()),
    highlighted: parseAsString,
    employeeId: parseAsString,
    spotlight: parseAsString,
  };

  const filteredParams = Object.keys(options).reduce((acc, iter) => {
    acc[iter] = parseWithCompression(defaultParams[iter]);
    return acc;
  }, {});

  const serialize = createSerializer(filteredParams);
  const params = serialize(options);

  return `${ORG_CHART_URL_BASE}${params}`;
};
