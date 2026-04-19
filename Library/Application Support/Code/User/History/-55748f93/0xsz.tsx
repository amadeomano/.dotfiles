import type { ExportSettingsView } from '@personio-web/payroll-view-export-settings';
import { ErrorBoundary } from '@personio-web/payroll-component-error-boundary';
import { FormProvider, useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { Stack } from 'designSystem/component/layout';
import { AddisonExternalCompanyId } from './components/AddisonExternalCompanyId';
import {
  useGetIntegrationSettings,
  usePutIntegrationSettings,
} from '@personio-web/payroll-data-payroll-integration-settings';
import { useActiveLegalEntityId } from './hooks/useActiveLegalEntityId';
import { getIntegrationSettingsPayloadFromForm } from './form/getIntegrationSettingsPayloadFromForm';
import { useExportSettingsToasts } from './hooks/useExportSettingsToasts';
import { ExportSettingsForm } from './form/ExportSettingsForm';
import { SettingsSaveActionBar } from './components/SettingsSaveActionBar';

export const ExportSettings: ExportSettingsView = () => {
  const legalEntityId = useActiveLegalEntityId();
  const { notifySaveSuccess, notifySaveError } = useExportSettingsToasts();
  const { data: settingsData, isLoading } = useGetIntegrationSettings(
    'addison',
    legalEntityId,
  );
  const updateIntegrationSettings = usePutIntegrationSettings(
    'addison',
    legalEntityId,
  );

  const externalCompanyId = settingsData?.externalCompanyId;
  const form = useForm<ExportSettingsForm>({
    mode: 'onChange',
    defaultValues: {
      external_company_id: externalCompanyId,
    },
  });

  useEffect(() => {
    form.reset({
      external_company_id: settingsData?.externalCompanyId ?? '',
    });
  }, [settingsData]);

  const handleCancel = () => {
    form.reset(baseLineFormState);
  };

  const handleSave = async () => {
    const isValid = await form.trigger();

    if (isValid) {
      const payload = getIntegrationSettingsPayloadFromForm(form);

      updateIntegrationSettings.mutate(payload, {
        onSuccess: () => {
          notifySaveSuccess();
          setBaseLineFormState(form.getValues());
        },
        onError: () => {
          notifySaveError();
        },
      });
    }
  };

  return (
    <ErrorBoundary boundaryId={'addison-settings'}>
      <FormProvider {...form}>
        <Stack space="gap-large">
          <AddisonExternalCompanyId
            isLoading={isLoading}
            value={baseLineFormState.external_company_id}
          />
          <SettingsSaveActionBar onCancel={handleCancel} onSave={handleSave} />
        </Stack>
      </FormProvider>
    </ErrorBoundary>
  );
};
