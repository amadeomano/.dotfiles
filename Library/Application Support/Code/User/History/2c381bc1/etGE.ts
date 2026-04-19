import { useCallback, useMemo } from 'react';
import { useRouter, type NextRouter } from 'next/router';

const URL_PARAM_LEGAL_ENTITY = 'le';
type QueryElement = string | undefined;

const legalEntityGetter: (router: NextRouter) => () => string | undefined = (
  router,
) => {
  console.log('[DEB]', 'creating getter');
  return () => {
    return router.query[URL_PARAM_LEGAL_ENTITY] as QueryElement;
  };
};

const legalEntitySetter: (router: NextRouter) => (id: string) => void =
  (router) => (id) =>
    router.replace({
      query: { ...router.query, [URL_PARAM_LEGAL_ENTITY]: id },
    });

const legalEntityUnsetter: (router: NextRouter) => (id: string) => void =
  (router) => () => {
    console.log('[DEB]', 'creating unsetter');
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [URL_PARAM_LEGAL_ENTITY]: omitedLegalEntityID,
      ...queryWithoutLegalEntityID
    } = router.query;
    router.replace({ query: queryWithoutLegalEntityID });
  };

export const useLegalEntityNavigator = () => {
  const router = useRouter();
  const { [URL_PARAM_LEGAL_ENTITY]: dep } = router.query;

  /* eslint-disable react-hooks/exhaustive-deps */
  const getLegalEntityID = useCallback(legalEntityGetter(router), [dep]);
  const setLegalEntityID = useCallback(legalEntitySetter(router), [dep]);
  const unsetLegalEntityID = useCallback(legalEntityUnsetter(router), [dep]);
  const currentLegalEntityId = useMemo(getLegalEntityID, [dep]);
  /* eslint-enable react-hooks/exhaustive-deps */

  return {
    currentLegalEntityId,
    getLegalEntityID,
    setLegalEntityID,
    unsetLegalEntityID,
  };
};
