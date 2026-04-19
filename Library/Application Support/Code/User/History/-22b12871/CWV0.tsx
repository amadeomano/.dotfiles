import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';
import {
  useListOrgUnitsLayers,
  type ListOrgUnitsLayersQueryResult,
} from '@personio-web/employees-organizations-gofer';
import { FormField } from 'designSystem/component/form-field';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Icon, icons } from 'designSystem/component/icon';
import { Label } from 'designSystem/component/label';
import { Inline, Stack } from 'designSystem/component/layout';

import {
  TYPE_MAP,
  DEFAULT_LANGUAGE_CODE,
  DEFAULT_LAYER_LEVEL_MIN,
  DEFAULT_LAYER_LEVEL_MAX,
} from '../../consts/orgUnitsLayers';
import { getDefaultLayerLabel } from '../../utils/getDefaultLayerLabel';
import styles from './OrgUnitsLayersPicker.module.scss';

type Props = {
  value: string;
  type: 'department' | 'team';
  parentId?: string[];
  parentLayerLevel?: number;
  errorText?: string;
  onChange: (value: string) => void;
};

type OrgUnitLayer = NonNullable<
  ListOrgUnitsLayersQueryResult['layers']
>['list'][number];

const getOptionLabel = (layer: OrgUnitLayer) =>
  layer.labels[DEFAULT_LANGUAGE_CODE]?.text ??
  getDefaultLayerLabel(layer.level);

/**
 * We disabled some layers based on the parentId and parentLayerLevel
 * E.g.if parentLayerLevel is 3, options 1 and 2 are disabled
 */
const getOptionDisabled = (
  layer: OrgUnitLayer,
  parentId: string[] | undefined,
  parentLayerLevel: number,
) =>
  !(parentId &&
  parentId?.length > 0 &&
  parentLayerLevel <= DEFAULT_LAYER_LEVEL_MAX
    ? layer.level > parentLayerLevel || layer.level === DEFAULT_LAYER_LEVEL_MAX
    : true);

const OrgUnitsLayersPicker = ({
  value,
  type,
  parentId,
  parentLayerLevel = DEFAULT_LAYER_LEVEL_MIN,
  errorText = '',
  onChange,
}: Props) => {
  const { data, isLoading } = useListOrgUnitsLayers();

  const { t } = useTranslation('org-units');

  const options = useMemo(() => {
    return data?.data?.layers?.list
      ?.filter((layer) => TYPE_MAP[type] === layer.type)
      .map((layer) => ({
        label: getOptionLabel(layer),
        value: layer.level ? String(layer.level) : '',
        disabled: getOptionDisabled(layer, parentId, parentLayerLevel),
      }));
  }, [data, type, parentLayerLevel, parentId]);

  if (isLoading) return null;

  return (
    <Stack space="gap-default">
      <Inline>
        <Label
          title={t('attributes.layer')}
          tooltip={t('attributes.layer-subtitle')}
        />
      </Inline>
      <FormField.Picker
        id="layerLevel"
        metadata={{
          testId: 'edit-form-layer-level-field',
        }}
        title=""
        options={options ?? []}
        selected={value}
        onChange={onChange}
        className={styles.container}
        errorText={errorText}
        searchConfig={{
          enabled: false,
        }}
        size="fullWidth"
      />
    </Stack>
  );
};

export default OrgUnitsLayersPicker;
