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
  const preferences = useOrgChartPreferencesContext();

  const positionAttributeIds = useMemo<PositionAttribute[]>(() => {
    return preferences.visibleAttributeIds.filter((id) =>
      allowedPositionAttributes.includes(id as PositionAttribute),
    ) as PositionAttribute[];
  }, [preferences.visibleAttributeIds]);

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
