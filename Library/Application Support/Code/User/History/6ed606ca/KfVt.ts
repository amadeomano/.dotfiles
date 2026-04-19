import { worker } from './client/browser';
import { MocksLib } from './enums';
import type {
  HandlerScopes,
  RegisteredHandlers,
  UserSelections,
} from './types';

export const unhandledRequests: Record<string, number> = {};
export const unhandledTranslations: Record<string, number> = {};
export const registeredHandlers: RegisteredHandlers = {};
export const conflictingHandlers: Record<string, number> = {};
export const missingDesiredHandler: Record<string, string> = {};

export const workerReady = worker.start({
  onUnhandledRequest(req) {
    const localhost = req.url.hostname === 'localhost';
    if (
      !localhost ||
      req.url.pathname.startsWith('/_next/') ||
      req.url.pathname.startsWith('/artifact-service/') ||
      req.url.pathname.endsWith('.js')
    ) {
      return;
    }

    const target = localhost ? req.url.pathname : req.url.href;
    unhandledRequests[target] = (unhandledRequests[target] || 0) + 1; // count how many times it was called
    console.warn('Found an unhandled %s request to %s', req.method, target);
  },
});

export const registerHandlers = (appHandlers: HandlerScopes) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (window.INTEGRATED_LOCAL) {
    return;
  }

  const userSettings: UserSelections = JSON.parse(
    window.localStorage.getItem(MocksLib.localStorageKey) || '{}',
  );

  const handlerScopes = Object.keys(appHandlers);
  const handlersToRegister = handlerScopes
    .map((scope) => {
      const availableHandlers = Object.keys(appHandlers[scope]);
      const desiredHandler = userSettings[scope] || MocksLib.defaultHandler;
      const isDesiredAvailable = availableHandlers.includes(desiredHandler);
      let actualHandler = desiredHandler;
      console.log('[] desiredHandler', desiredHandler);
      console.log('[] registeredHandlers', registeredHandlers);

      if (!isDesiredAvailable) {
        console.log('[] unavailable', actualHandler);
        actualHandler = MocksLib.defaultHandler;
        missingDesiredHandler[scope] = desiredHandler;
      }

      if (registeredHandlers[scope]) {
        // If a handler already exists with that name, keep track of how many times its registered
        conflictingHandlers[scope] = (conflictingHandlers[scope] || 0) + 1;
      }

      registeredHandlers[scope] = (registeredHandlers[scope] ?? []).concat(
        availableHandlers,
      );
      console.log(
        '[] return [scope: %s][actualHandler: %s]',
        scope,
        actualHandler,
        appHandlers[scope][actualHandler],
      );
      return appHandlers[scope][actualHandler];
    })
    .filter((handler) => handler);

  if (handlersToRegister.length) {
    if (
      handlersToRegister.some((h) => h.info.header.includes('legal-entities'))
    )
      console.log(
        '[] registering',
        handlersToRegister.filter(
          (h) => h.info.header === 'GET /org-management/v1/legal-entities',
        ),
      );
    worker.use(...handlersToRegister);
  }

  console.log('[] conflictingHandlers', conflictingHandlers);
};
