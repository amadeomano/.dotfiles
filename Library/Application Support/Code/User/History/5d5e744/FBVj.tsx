import React from 'react';

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { loadDevMessages, loadErrorMessages } from '@apollo/client/dev';
import { renderHook } from '@testing-library/react';

import { getPersonioTranslation } from '@personio-web/config-jest/helpers';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';
import { OrgChartDataSourceContextProvider } from '../src/hooks';
import {
  renderWithWrapper as renderWithWrapperFn,
  TestWrapper,
  type TestWrapperProps,
} from '@personio-web/orchestrator-common/test-utils';

import { type OrgChartPreferences } from '../src/types';

loadDevMessages();
loadErrorMessages();

const GOFER_SERVICE_URL = '/public/athena/graphql';

export const apolloClient = new ApolloClient({
  uri: GOFER_SERVICE_URL,
  cache: new InMemoryCache(),
});

export const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ApolloProvider client={apolloClient}>
    <DialogProvider>{children}</DialogProvider>
  </ApolloProvider>
);

export function renderHookWithWrapper<TProps = never, TResult = void>(
  hook: (props: TProps) => TResult,
  options?: TestWrapperProps,
) {
  const InnerWrapper = options?.innerWrapper
    ? options.innerWrapper
    : React.Fragment;

  return renderHook<TResult, TProps>(hook, {
    wrapper: ({ children }) => (
      <TestWrapper
        features={options?.features}
        router={options?.router}
        innerWrapper={Wrapper}
        authClaim={options?.authClaim}
      >
        <InnerWrapper>{children}</InnerWrapper>
      </TestWrapper>
    ),
  });
}

export function renderWithWrapper(
  component: React.ReactElement,
  options?: TestWrapperProps,
) {
  const InnerWrapper = options?.innerWrapper
    ? options.innerWrapper
    : React.Fragment;
  return renderWithWrapperFn(component, {
    ...options,
    innerWrapper: ({ children }) => (
      <Wrapper>
        <InnerWrapper>{children}</InnerWrapper>
      </Wrapper>
    ),
  });
}

export function getTranslation(
  namespace: string,
  {
    keyPrefix,
  }: {
    keyPrefix: string;
  },
) {
  const { t: tBase } = getPersonioTranslation(
    namespace as Parameters<typeof getPersonioTranslation>[0],
  );

  return {
    t: (key: string, values: Record<string, unknown> = {}) =>
      tBase(`${keyPrefix}.${key}` as never, values),
  };
}

export const mockOrgChartPreferencesProps: OrgChartPreferences = {
  setFilters: jest.fn(),
  searchTerm: '',
  setSearchTerm: jest.fn(),
  filters: [],
  view: null,
  setView: jest.fn(),
  cardPreferences: {
    personalInfo: false,
    avatars: false,
    cardClustering: false,
    openPositions: false,
  },
  setCardPreferences: jest.fn(),
  attributes: [],
  setAttributes: jest.fn(),
  highlighted: '',
  setHighlighted: jest.fn(),
  focusedEmployeeId: '',
  setFocusedEmployeeId: jest.fn(),
  spotlight: '',
  setSpotlight: jest.fn(),
  spotlightVisibleRelationships: [],
  setSpotlightVisibleRelationships: jest.fn(),
  sortByAttribute: false,
  setSortByAttribute: jest.fn(),
};
