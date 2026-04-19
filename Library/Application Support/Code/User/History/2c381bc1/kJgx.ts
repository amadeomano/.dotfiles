import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';

export const URL_PARAM_LEGAL_ENTITY = 'le';

type QueryElement = string | undefined;

export const useLegalEntityNavigator = () => {
  const router = useRouter();
  const dep = [router.query[URL_PARAM_LEGAL_ENTITY]];

  const getLegalEntityID = useCallback(
    (): string | undefined =>
      router.query[URL_PARAM_LEGAL_ENTITY] as QueryElement,
    dep,
  );

  const setLegalEntityID = (id: string): void => {
    router.replace({
      query: { ...router.query, [URL_PARAM_LEGAL_ENTITY]: id },
    });
  };

  const unsetLegalEntityID = (): void => {
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [URL_PARAM_LEGAL_ENTITY]: omitedLegalEntityID,
      ...queryWithoutLegalEntityID
    } = router.query;
    router.replace({ query: queryWithoutLegalEntityID });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentLegalEntityId = useMemo(getLegalEntityID, [router.asPath]);

  return {
    currentLegalEntityId,
    getLegalEntityID,
    setLegalEntityID,
    unsetLegalEntityID,
  };
};
