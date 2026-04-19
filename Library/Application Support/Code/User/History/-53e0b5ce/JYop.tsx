import { Controller, type FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  suffixMetadata,
  parseMetadata,
} from '@personio-web/design-system-utils';
import { OrgUnitsPicker } from '@personio-web/employees-organizations-feature-org-units-picker';
import {
  useGetOrgUnit,
  type GetOrgUnitQueryResult,
} from '@personio-web/employees-organizations-gofer';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';
import { FormField } from 'designSystem/component/form-field';
import { Stack } from 'designSystem/component/layout';

import { useAuthContext } from '@personio-web/auth-context';
import {
  DEFAULT_LAYER_LEVEL_MIN,
  DEFAULT_LAYER_LEVEL_MAX,
} from '../../consts/orgUnitsLayers';
import { attributeLength } from '../../hooks';
import { TestIds } from '../../utils/test-ids';
import OrgUnitsLayersPicker from '../org-units-layers-picker';
import OrgUnitsLeadsPicker from '../org-units-leads-picker';
import type { OrgUnitsFormProps } from './types';

type OrgUnits = NonNullable<GetOrgUnitQueryResult['orgUnit']>['orgUnit'][];

export const OrgUnitsForm = ({
  id,
  type,
  errors,
  control,
  metadata,
  setValue,
  watch,
}: OrgUnitsFormProps) => {
  const { t } = useTranslation('org-units');
  const { companyId } = useAuthContext();

  const { isOn: isOnGH, isReady: isReadyGH } = useFeatureFlag(
    FeatureFlags.ENABLE_GLOBAL_HIERARCHIES,
  );
  const { isOn: isOnLeads, isReady: isReadyLeads } = useFeatureFlag(
    FeatureFlags.ENABLE_LEADS,
  );
  const isLeadsEnabled = isReadyLeads && isOnLeads;
  const isGlobalHierarchiesEnabled = isReadyGH && isOnGH;

  const watchedParentId = watch('parentId');
  const { data: parent } = useGetOrgUnit({
    variables: {
      id: String(watchedParentId),
      companyId,
    },
    queryOptions: {
      enabled: Boolean(String(watchedParentId)),
    },
  });

  const parentLayerLevel =
    parent?.data?.orgUnit?.orgUnit?.layerLevel || DEFAULT_LAYER_LEVEL_MIN;

  return (
    <form noValidate {...parseMetadata(metadata)}>
      <Stack space="section-xsmall">
        <Controller
          control={control}
          name="parentId"
          render={({ field }) => (
            <OrgUnitsPicker
              type={type}
              id={field.name}
              title={
                type === 'department'
                  ? t('write.title-parent-department')
                  : t('write.title-parent-team')
              }
              placeholder={t('write.placeholder-parent')}
              multiple={false}
              errorText={(errors.parentId as unknown as FieldError)?.message}
              selected={field.value ?? []}
              onChange={(value, orgUnits) => {
                const orgUnit = (orgUnits as OrgUnits)?.[0] || null;
                if (orgUnit) {
                  const orgUnitLayerLevel =
                    (orgUnit.layerLevel || DEFAULT_LAYER_LEVEL_MIN) + 1;
                  const layerLevel =
                    orgUnitLayerLevel <= DEFAULT_LAYER_LEVEL_MAX
                      ? orgUnitLayerLevel
                      : DEFAULT_LAYER_LEVEL_MAX;
                  setValue('layerLevel', String(layerLevel));
                } else {
                  setValue('layerLevel', String(DEFAULT_LAYER_LEVEL_MIN));
                }
                field.onChange(value);
              }}
              currentOrgUnitId={String(id)}
              metadata={suffixMetadata(metadata, TestIds.ParentIdField)}
              useLegacyId={false}
            />
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <FormField.Input
              {...field}
              tooltip="something"
              autoComplete="off"
              autoCorrect="off"
              id={field.name}
              aria-autocomplete="none"
              title={t('attributes.name')}
              placeholder={t('write.placeholder-name')}
              errorText={errors?.name?.message}
              data-1p-ignore
              minLength={attributeLength.name.min}
              maxLength={attributeLength.name.maxLength}
              {...parseMetadata(suffixMetadata(metadata, TestIds.NameField))}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <FormField.TextArea
              {...field}
              autoComplete="off"
              autoCorrect="off"
              id={field.name}
              title={t('attributes.about')}
              placeholder={
                type === 'department'
                  ? t('write.placeholder-about-department')
                  : t('write.placeholder-about-team')
              }
              errorText={errors?.description?.message}
              maxLength={attributeLength.description.maxLength}
              {...parseMetadata(
                suffixMetadata(metadata, TestIds.DescriptionField),
              )}
            />
          )}
        />
        <Controller
          control={control}
          name="resourceUri"
          render={({ field }) => (
            <FormField.Input
              {...field}
              autoComplete="off"
              autoCorrect="off"
              id={field.name}
              title={t('attributes.resource')}
              placeholder={t('write.placeholder-resource')}
              errorText={errors?.resourceUri?.message}
              maxLength={attributeLength.resourceUri.maxLength}
              {...parseMetadata(
                suffixMetadata(metadata, TestIds.ResourceUriField),
              )}
            />
          )}
        />
        <Controller
          control={control}
          name="abbreviation"
          render={({ field }) => (
            <FormField.Input
              {...field}
              autoComplete="off"
              autoCorrect="off"
              id={field.name}
              title={t('attributes.abbreviation')}
              placeholder={t('write.placeholder-abbreviation')}
              errorText={errors?.abbreviation?.message}
              maxLength={attributeLength.abbreviation.maxLength}
              {...parseMetadata(
                suffixMetadata(metadata, TestIds.AbbreviationField),
              )}
            />
          )}
        />
        {isGlobalHierarchiesEnabled && (
          <Controller
            control={control}
            name="layerLevel"
            render={({ field }) => (
              <OrgUnitsLayersPicker
                value={field.value || ''}
                type={type}
                parentId={watchedParentId}
                parentLayerLevel={parentLayerLevel}
                errorText={errors?.layerLevel?.message}
                onChange={(value) => {
                  field.onChange(value);
                }}
              />
            )}
          />
        )}
        {isLeadsEnabled && (
          <Controller
            control={control}
            name="leadIds"
            render={({ field }) => (
              <OrgUnitsLeadsPicker
                values={field.value || []}
                onChange={field.onChange}
              />
            )}
          />
        )}
      </Stack>
    </form>
  );
};
