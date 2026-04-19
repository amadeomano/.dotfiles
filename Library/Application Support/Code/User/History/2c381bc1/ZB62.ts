import { parseAsString, useQueryState } from 'nuqs-next-router';

const URL_PARAM_LEGAL_ENTITY = 'le';

export const useLegalEntityNavigator = () => {
  const [legalEntityId, setLegalEntityId] = useQueryState(
    URL_PARAM_LEGAL_ENTITY,
    parseAsString,
  );

  return { legalEntityId, setLegalEntityId };
};
