import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
} from 'react';

import { allowedPositionAttributes } from '../constants';
import {
  getPositionCardDataLoader,
  type PositionCardDataLoader,
} from '../loaders';
import { useOrgChartPreferencesContext } from '../hooks';
import { type PositionAttribute } from '../types';

export const PositionCardDataLoaderContext = createContext<
  | {
      positionCardDataLoader: PositionCardDataLoader;
    }
  | undefined
>(undefined);

export const PositionCardDataLoaderProvider = ({
  children,
}: PropsWithChildren) => {
  const positionAttributeIds = useMemo<PositionAttribute[]>(() => {
    return attributeIds?.filter((id) =>
      allowedPositionAttributes.includes(id as PositionAttribute),
    ) as PositionAttribute[];
  }, [attributeIds]);

  const positionCardDataLoader = useMemo(
    () => getPositionCardDataLoader(positionAttributeIds),
    [positionAttributeIds],
  );

  return (
    <PositionCardDataLoaderContext.Provider value={{ positionCardDataLoader }}>
      {children}
    </PositionCardDataLoaderContext.Provider>
  );
};

export const usePositionCardDataLoader = () => {
  const loaderContext = useContext(PositionCardDataLoaderContext);

  if (loaderContext === undefined) {
    throw new Error(
      'usePositionCardDataLoader must be used within a PositionCardDataLoaderProvider',
    );
  }

  return loaderContext;
};
