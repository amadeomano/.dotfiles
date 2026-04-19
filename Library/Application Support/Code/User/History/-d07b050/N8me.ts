import { mockHandlers as dataCommonMockHandlers } from '@personio-web/data-common/mocking';
import { globalPreferencesHandlers } from '@personio-web/data-global-preferences';
import { mockHandlers as screenSharingHandlers } from '@personio-web/data-screen-sharing/mocking';
import { mockHandlers as dataTrackingHandlers } from '@personio-web/data-tracking-data/mocking';
import { loadModule } from '@personio-web/federated-module';
import { type HandlerScopes, registerHandlers } from '@personio-web/mocks';
import { stonlyHandlers } from '@personio-web/mocks/handlers';
import { worker } from '@personio-web/mocks/src/client/browser';
import * as navigationHandlers from '@personio-web/navigation-integration/src/mocking/handlers';
import { getTranslationMocksHandler } from '@personio-web/translations';
import { productAreasCamelCase } from '@personio-web/ffs/product-areas.json';

import * as mockHandlers from './handlers';

const excludeFromMocking = [
  'designSystem',
  'documentManagement',
  'workManagement',
  // 'payroll',
  'timeMoney',
];

productAreasCamelCase
  .filter((pa) => !excludeFromMocking.includes(pa))
  .forEach((remote) => {
    loadModule({ remote, module: './registerMocks' })().catch(() =>
      console.warn(`No "./registerMocks" found for remote: ${remote}`),
    );
  });

const { getApplicationContextHandlers } = dataCommonMockHandlers;

registerHandlers({
  ...mockHandlers,
  ...navigationHandlers,
  ...dataTrackingHandlers,
  ...screenSharingHandlers,
  ...globalPreferencesHandlers,
  getApplicationContextHandlers,
  getTranslationMocksHandler,
} as unknown as HandlerScopes);

const others = { ...stonlyHandlers };
for (const handler in others) {
  worker.use(others[handler]);
}
