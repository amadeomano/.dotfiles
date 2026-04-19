import { useCallback, useEffect, useState } from 'react';

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
  const [isDrawerFullyOpened, setIsDrawerFullyOpened] = useState(!!queryValue);

  // Waiting 1.5 times the animation duration
  // to ensure the animation is complete and DOM is updated.
  // The duration is not exposed from the design system, so we need to use a constant.
  // https://github.com/Personio-Internal/personio-web/blob/ca6b3c5d39ed6855cb8d4be06bf5648dcf17c5ac/product-areas/design-system/components/panel/src/utils/motionVariants.ts#L6
  const DEFAULT_ANIMATION_DURATION = 0.24 * 1000; // 240 ms
  const ANIMATION_DURATION = DEFAULT_ANIMATION_DURATION + 60; // 300 ms

  const setQueryValueWithCallback = useCallback(
    (
      value:
        | OrgUnitDetailsState
        | null
        | ((prev: OrgUnitDetailsState | null) => OrgUnitDetailsState | null),
      onComplete: () => void,
    ) => {
      if (!queryValue) {
        onComplete();
        return;
      }
      setQueryValue(value);

      const timeout = setTimeout(onComplete, ANIMATION_DURATION);

      return () => clearTimeout(timeout);
    },
    [queryValue, setQueryValue],
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsDrawerFullyOpened(!!queryValue);
    }, ANIMATION_DURATION);
    return () => clearTimeout(timeout);
  }, [queryValue]);

  return {
    state: queryValue,
    setState: setQueryValue,
    setStateWithCallback: setQueryValueWithCallback,
    isDrawerFullyOpened,
  };
};
