import { ActionBar } from '@highlight-ui/action-bar';
import { Checkbox } from '@highlight-ui/checkbox';
import { FormField } from '@highlight-ui/form-field';
import { Link } from '@highlight-ui/link';
import { Select } from '@highlight-ui/select';
import { Body } from '@highlight-ui/typography';
import { Translate } from '@personio-web/translate-component';
import isEqual from 'lodash/isEqual';
import { useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Requests } from '../../../../../api';
import { MICRO_FRONTEND_TRANSLATION_NAMESPACE } from '../../../../../application/config/constants';
import { OptionalTooltip } from '../../../../../components/OptionalTooltip/OptionalTooltip';
import type { TransKey } from '../../../../../shared/types';
import { orderAttributesBySelectedFirst } from '../../../CreateCustomIntegrationDrawer/ConfigureAccessRightsStep/orderAttributesBySelectedFirst';
import { orderLegalEntitiesBySelectedFirst } from '../../../CreateCustomIntegrationDrawer/ConfigureAccessRightsStep/orderLegalEntitiesBySelectedFirst';
import styles from '../AccessRightsTab.module.scss';
import {
  type AttributeSelectOption,
  type CustomIntegrationAuthState,
  type InitialState,
  type LegalEntitiesSelectOption,
  getInitialState,
  reducer,
} from './reducer';

type Props = {
  attributesList: Requests['Attributes']['data'];
  legalEntitiesList: Requests['LegalEntities']['legalEntities'];
  auth: Requests['Auth'];
  isButtonLoadingState: boolean;
  updateIntegration: (updatedData: Requests['Auth']) => void;
  isFormDirty: (isDirty: boolean) => void;
  integrationName: string;
};

const isAnythingSelected = (
  accessRightsState: CustomIntegrationAuthState,
): boolean => {
  const maybeSelectedAccessRight = accessRightsState.scopes.find(
    (s) => s.isRead || s.isWrite,
  );
  return !!maybeSelectedAccessRight;
};

const hasAccessRightsChanged = ({
  currentState,
  clientId,
  initialSelectedScopes,
  initialAllowedEmployeeAttributes,
  initialLegalEntities,
}: {
  currentState: CustomIntegrationAuthState;
  clientId: Requests['Auth']['clientId'];
  initialSelectedScopes: Requests['Auth']['scopes'];
  initialAllowedEmployeeAttributes: AttributeSelectOption[];
  initialLegalEntities: LegalEntitiesSelectOption[];
}): boolean => {
  return !isEqual(
    {
      clientId: clientId,
      scopes: initialSelectedScopes,
      allowedEmployeeAttributes: [...initialAllowedEmployeeAttributes].sort(
        (a, b) => (a.label > b.label ? 1 : -1),
      ),
      legalEntities: initialLegalEntities,
    },
    {
      ...currentState,
      allowedEmployeeAttributes: [
        ...currentState.allowedEmployeeAttributes,
      ].sort((a, b) => (a.label > b.label ? 1 : -1)),
      scopes: currentState.scopes,
      legalEntities: currentState.legalEntities,
    },
  );
};

function transformInitiallySelectedAllowedAttributes(
  authAttributes: Requests['Auth'],
  attributesList: Requests['Attributes']['data'],
): AttributeSelectOption[] {
  return authAttributes.allowedEmployeeAttributes.map((allowedAttribute) => ({
    value: allowedAttribute,
    label:
      attributesList.find((attribute) => attribute.key === allowedAttribute)
        ?.label || '',
  }));
}

function transformInitiallySelectedLegalEntities(
  authAttributes: Requests['Auth'],
  legalEntitiesList: Requests['LegalEntities']['legalEntities'],
): LegalEntitiesSelectOption[] {
  if (
    authAttributes?.accessibleBy === null ||
    authAttributes?.accessibleBy?.legalEntities.length === 0
  ) {
    return legalEntitiesList.map((legalEntity) => ({
      value: legalEntity.id,
      label: legalEntity.attributes.name,
    }));
  } else {
    return (
      authAttributes?.accessibleBy?.legalEntities?.map((legalEntity) => ({
        value: legalEntity.id,
        label:
          legalEntitiesList.find((l) => legalEntity.id === l.id)?.attributes
            .name || '',
      })) || []
    );
  }
}

export const CustomAccessRightsTab = ({
  attributesList,
  auth,
  isButtonLoadingState,
  updateIntegration,
  isFormDirty,
  integrationName,
  legalEntitiesList,
}: Props) => {
  const { t } = useTranslation(MICRO_FRONTEND_TRANSLATION_NAMESPACE);

  const initialStateInput: InitialState = {
    innerAuth: auth,
    allowedEmployeeAttributes: transformInitiallySelectedAllowedAttributes(
      auth,
      attributesList,
    ),
    legalEntities: transformInitiallySelectedLegalEntities(
      auth,
      legalEntitiesList,
    ),
  };
  const [state, dispatch] = useReducer(
    reducer,
    initialStateInput,
    getInitialState,
  );

  const [attributeOptions, setAttributeOptions] = useState<
    AttributeSelectOption[]
  >(
    attributesList?.map(({ label, key }) => ({
      label,
      value: key,
    })) || [],
  );
  console.log('[]', attributeOptions);
  console.log(
    '[] shown',
    orderAttributesBySelectedFirst(
      state.allowedEmployeeAttributes,
      attributeOptions,
    ),
  );

  const [legalEntitiesOptions, setLegalEntitiesOptions] = useState<
    LegalEntitiesSelectOption[]
  >(
    legalEntitiesList.map((legalEntity) => ({
      label: legalEntity.attributes.name,
      value: legalEntity.id,
    })) || [],
  );

  useEffect(() => {
    isFormDirty(
      hasAccessRightsChanged({
        currentState: state,
        clientId: auth.clientId,
        initialSelectedScopes: auth.scopes,
        initialAllowedEmployeeAttributes:
          transformInitiallySelectedAllowedAttributes(auth, attributesList),
        initialLegalEntities: transformInitiallySelectedLegalEntities(
          auth,
          legalEntitiesList,
        ),
      }),
    );
  }, [attributesList, auth, isFormDirty, state, legalEntitiesList]);

  const isEmployeeScopeReadNotSelected =
    state.scopes.find((scope) => scope.domain === 'employees')?.isRead ===
    false;

  const isCompensationScopeNotSelected =
    state.scopes.find((scope) => scope.domain === 'personio:compensations')
      ?.isRead === false;

  const isScopeReadOnly = [
    'personio:legal-entities',
    'personio:org-units',
    'reports.custom',
  ];

  return (
    <>
      <div className={styles.drawerBody}>
        <div className={styles.tabDescription}>
          <Body as="span">
            {t(
              'connected-integrations.drawer.steps.view-custom-party-integrations.access-rights.step-description',
              { integrationName },
            )}
          </Body>
        </div>

        <div className={styles.rightSide}>
          <div
            className={styles.scopesContainer}
            data-test-id="scopes-container"
          >
            {state.scopes.map((scope) => (
              <div className={styles.scopeRow} key={scope.domain}>
                <div>
                  <Body variant="base" color="text-default">
                    <div className={styles.scopeLabel}>
                      {t(scope.label as TransKey)}
                    </div>
                  </Body>
                </div>
                <div>
                  <Checkbox
                    label={t(
                      'connected-integrations.drawer.steps.configure-access-rights.field-scopes-read',
                    )}
                    checked={scope.isRead}
                    onChange={() =>
                      dispatch({
                        type: 'TOGGLE_IS_READ',
                        domain: scope.domain,
                      })
                    }
                  />
                </div>
                <div>
                  <Checkbox
                    label={t(
                      'connected-integrations.drawer.steps.configure-access-rights.field-scopes-write',
                    )}
                    checked={scope.isWrite}
                    onChange={() =>
                      dispatch({
                        type: 'TOGGLE_IS_WRITE',
                        domain: scope.domain,
                      })
                    }
                    disabled={isScopeReadOnly.includes(scope.domain)}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className={styles.attributesContainer}>
            <FormField
              label={t(
                'connected-integrations.drawer.steps.configure-access-rights.field-attributes-label',
              )}
              labelTooltipContent={t(
                'connected-integrations.drawer.steps.configure-access-rights.field-attributes-tooltip',
              )}
              helperText={
                <Body color="text-subdued">
                  <Translate
                    namespace={MICRO_FRONTEND_TRANSLATION_NAMESPACE}
                    i18nKey={
                      'connected-integrations.drawer.steps.configure-access-rights.field-attributes-helper-text'
                    }
                    components={{
                      a: <Link variant="inline" />,
                    }}
                  />
                </Body>
              }
            >
              <OptionalTooltip
                tooltipContent={
                  <Body>
                    {t(
                      'connected-integrations.drawer.steps.configure-access-rights.field-attributes-validation-tooltip',
                    )}
                  </Body>
                }
                showTooltip={isEmployeeScopeReadNotSelected}
              >
                <Select
                  variant="full-width"
                  className={styles.selectWrapper}
                  metadata={{
                    testId: 'attributes-select',
                    actionName: 'field-attributes',
                  }}
                  multiple
                  options={attributeOptions}
                  triggerLabel={t(
                    'connected-integrations.drawer.steps.configure-access-rights.field-attributes-placeholder',
                  )}
                  disabled={isEmployeeScopeReadNotSelected}
                  onSelect={(selectedAttributes) =>
                    dispatch({
                      type: 'SET_SELECTED_CUSTOM_INTEGRATION_ATTRIBUTES',
                      allowedEmployeeAttributes: selectedAttributes,
                    })
                  }
                  selectedOptions={state.allowedEmployeeAttributes}
                  onListVisibilityChange={() =>
                    setAttributeOptions(
                      orderAttributesBySelectedFirst(
                        state.allowedEmployeeAttributes,
                        attributeOptions,
                      ),
                    )
                  }
                />
              </OptionalTooltip>
            </FormField>
          </div>
          {legalEntitiesList.length > 0 ? (
            <div className={styles.legalEntitiesContainer}>
              <FormField
                label={t(
                  'connected-integrations.drawer.steps.configure-access-rights.field-legal-entities.label-text',
                )}
                labelTooltipContent={t(
                  'connected-integrations.drawer.steps.configure-access-rights.field-legal-entities.tooltip-text',
                )}
                helperText={
                  <Body color="text-subdued">
                    <Translate
                      i18nKey={
                        'connected-integrations.drawer.steps.configure-access-rights.field-legal-entities.helper-text'
                      }
                      components={{
                        Link: <Link variant="inline" />,
                      }}
                      namespace={MICRO_FRONTEND_TRANSLATION_NAMESPACE}
                    />
                  </Body>
                }
              >
                <OptionalTooltip
                  tooltipContent={
                    <Body>
                      {t(
                        'connected-integrations.drawer.steps.configure-access-rights.field-legal-entities.field-tooltip-text',
                      )}
                    </Body>
                  }
                  showTooltip={isCompensationScopeNotSelected}
                >
                  <Select
                    variant="full-width"
                    className={styles.selectWrapper}
                    multiple
                    metadata={{
                      testId: 'legal-entities-select',
                      actionName: 'legal-entities',
                    }}
                    options={legalEntitiesOptions}
                    triggerLabel={t(
                      'connected-integrations.drawer.steps.configure-access-rights.field-legal-entities.field-trigger-label',
                    )}
                    disabled={isCompensationScopeNotSelected}
                    onSelect={(selectedOptions) => {
                      dispatch({
                        type: 'SET_SELECTED_CUSTOM_INTEGRATION_LEGAL_ENTITIES',
                        legalEntities: selectedOptions,
                      });
                    }}
                    selectedOptions={state.legalEntities}
                    onListVisibilityChange={() =>
                      setLegalEntitiesOptions(
                        orderLegalEntitiesBySelectedFirst(
                          state.legalEntities,
                          legalEntitiesOptions,
                        ),
                      )
                    }
                  />
                </OptionalTooltip>
              </FormField>
            </div>
          ) : null}
        </div>
      </div>
      <ActionBar
        className={styles.footer}
        primaryAction={{
          label: t(
            'connected-integrations.drawer.action-buttons.update',
          ) as string,
          buttonState: isButtonLoadingState
            ? 'loading'
            : hasAccessRightsChanged({
                currentState: state,
                clientId: auth.clientId,
                initialSelectedScopes: auth.scopes,
                initialAllowedEmployeeAttributes:
                  transformInitiallySelectedAllowedAttributes(
                    auth,
                    attributesList,
                  ),
                initialLegalEntities: transformInitiallySelectedLegalEntities(
                  auth,
                  legalEntitiesList,
                ),
              }) && isAnythingSelected(state)
            ? 'default'
            : 'disabled',
          onClick: () => {
            const updatedData = {
              clientId: state.clientId,
              scopes: state.scopes,
              allowedEmployeeAttributes: state.allowedEmployeeAttributes.map(
                (attribute) => attribute.value,
              ),
              accessibleBy: {
                legalEntities: state.legalEntities.map((legalEntity) => {
                  return { id: legalEntity.value };
                }),
              },
            };
            updateIntegration(updatedData);
          },
        }}
        variant="inline"
      />
    </>
  );
};
