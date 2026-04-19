import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { configureRequest } from '@personio/request';
import { API_BASE_URL, REQUEST_TIMEOUT } from '../config/constants';

import { UtilityStylesProvider } from '@personio-web/payroll-integrations-commons-utils';

import '../../shared/styles/highlight-ui.scss';

import '@personio-web/polyfills';
import { ErrorBoundary } from '@sentry/nextjs';
import Gatekeeper from './Gatekeeper/Gatekeeper';

configureRequest({
  timeout: REQUEST_TIMEOUT,
  baseURL: API_BASE_URL,
});

export const AppRoot: React.FC<React.PropsWithChildren<unknown>> = () => (
  <React.Suspense fallback="">
    <ErrorBoundary>
      <UtilityStylesProvider>
        <Router>
          <Routes>
            <Route path="*" element={<Gatekeeper />}></Route>
          </Routes>
        </Router>
      </UtilityStylesProvider>
    </ErrorBoundary>
  </React.Suspense>
);

export default AppRoot;
