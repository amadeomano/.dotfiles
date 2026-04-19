import { type RequestHandler } from 'msw';
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
  const handlersToRegister: RequestHandler[] = handlerScopes
    .map((scope) => {
      const availableHandlers = Object.keys(appHandlers[scope]);
      const desiredHandler = userSettings[scope] || MocksLib.defaultHandler;
      const isDesiredAvailable = availableHandlers.includes(desiredHandler);
      const isDesiredRegistered =
        registeredHandlers[scope]?.includes(desiredHandler);

      // if (isDesiredRegistered) return undefined;

      let actualHandler = desiredHandler;
      if (!isDesiredAvailable) {
        actualHandler = MocksLib.defaultHandler;
        missingDesiredHandler[scope] = desiredHandler;
      } else if (isDesiredAvailable && scope in missingDesiredHandler) {
        delete missingDesiredHandler[scope];
      }

      if (registeredHandlers[scope]) {
        // If a handler already exists with that name, keep track of how many times its registered
        conflictingHandlers[scope] = (conflictingHandlers[scope] || 0) + 1;
      }

      // registeredHandlers[scope] = (registeredHandlers[scope] ?? []).concat(
      //   availableHandlers,
      // );
      registeredHandlers[scope] = availableHandlers;

      return appHandlers[scope][actualHandler];
    })
    .filter((handler) => handler !== undefined);

  if (handlersToRegister.length) {
    worker.use(...handlersToRegister);
  }
};
