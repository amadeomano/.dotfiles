import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { useAuthContext } from '@personio-web/auth-context';

import {
  getPersonCardDataLoader,
  type PersonCardDataLoader,
  type PersonCardDataLoaderArgs,
} from '../loaders';

import { useOrgChartDataSourceContext } from '../hooks';

export const PersonCardDataLoaderContext = createContext<
  | {
      personCardDataLoader: PersonCardDataLoader;
    }
  | undefined
>(undefined);

export const PersonCardDataLoaderProvider = ({
  children,
  attributeIds,
  additionalSupervisorAttributeIds,
}: PropsWithChildren<
  Pick<
    PersonCardDataLoaderArgs,
    'attributeIds' | 'additionalSupervisorAttributeIds'
  >
>) => {
  const { companyId } = useAuthContext();
  const { additionalSupervisorAttributesData } = useOrgChartDataSourceContext();

  const personCardDataLoader = useMemo(
    () =>
      getPersonCardDataLoader({
        companyId,
        attributeIds,
        additionalSupervisorAttributeIds,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(additionalSupervisorAttributeIds),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(attributeIds),
      companyId,
    ],
  );

  return (
    <PersonCardDataLoaderContext.Provider value={{ personCardDataLoader }}>
      {children}
    </PersonCardDataLoaderContext.Provider>
  );
};

export const usePersonCardDataLoader = () => {
  const loaderContext = useContext(PersonCardDataLoaderContext);

  if (loaderContext === undefined) {
    throw new Error(
      'usePersonCardDataLoader must be used within a PersonCardDataLoaderProvider',
    );
  }

  return loaderContext;
};
