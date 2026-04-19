import { createParser, parseAsJson, useQueryState } from 'nuqs-next-router';
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';

const ORG_UNIT_DETAILS_PARAM = 'details';

export type OrgUnitDetailsState = {
  orgUnitId: number;
  orgUnitType: 'department' | 'team';
};

const parseWithCompression = createParser({
  parse: (queryValue) => {
    const decompressed = decompressFromEncodedURIComponent(queryValue);
    return parseAsJson<OrgUnitDetailsState>().parse(decompressed);
  },
  serialize: (value) => {
    return compressToEncodedURIComponent(
      parseAsJson<OrgUnitDetailsState>().serialize(value),
    );
  },
});

export const useOrgUnitDetailsState = () => {
  const [queryValue, setQueryValue] = useQueryState(
    ORG_UNIT_DETAILS_PARAM,
    parseWithCompression,
  );

  return [queryValue, setQueryValue] as const;
};
