import { parseAsString, useQueryState } from 'nuqs-next-router';

const URL_PARAM_LEGAL_ENTITY = 'le';

export const useLegalEntityNavigator = () => {
  const [] = useQueryState<string | undefined>(URL_PARAM_LEGAL_ENTITY);
};
