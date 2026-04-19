import React from 'react';
import { useController, type FieldPath } from 'react-hook-form';

import { Picker } from 'designSystem/component/picker';
import { useTranslation } from 'react-i18next';
import { type A3SettingsForm } from '../../A3SettingsForm';
import { TRANSLATION_NAMESPACE } from '../../constants';
import { type ExternalCompensation } from './types';

type ExternalCompensationSelectionProps = {
  availableCompensations: Array<ExternalCompensation>;
  name: FieldPath<A3SettingsForm>;
};
const ExternalCompensationSelection: React.FC<
  ExternalCompensationSelectionProps
> = ({ availableCompensations, name }) => {
  const { t } = useTranslation(TRANSLATION_NAMESPACE, {
    keyPrefix: 'athree.manage.compensations.selection',
  });
  const { field } = useController<A3SettingsForm>({ name });

  const setSelected = (newValue: string) => {
    field.onChange(newValue);
  };

  return (
    <Picker.Root {...field}>
      <Picker.ButtonTrigger placeholder={t('placeholder')} />
      <Picker.Content
        multiple={false}
        hideRadio
        options={availableCompensations.map(
          ({ externalCompensationId, externalCompensationName }) => ({
            value: externalCompensationId,
            label: externalCompensationName,
          }),
        )}
        selected={field.value as string}
        onChange={setSelected}
      />
    </Picker.Root>
  );
};

export default ExternalCompensationSelection;
