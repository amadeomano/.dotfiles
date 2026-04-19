import { type PropsWithChildren } from 'react';

import { ApolloError } from '@apollo/client';
import { waitFor } from '@testing-library/react';

import { listEmploymentsByPersonIdsHandlers } from '@personio-web/employees-organizations-data-gofer/mocking';
import {
  type PersonAttribute,
  PersonSystemAttribute,
} from '@personio-web/employees-organizations-util-people';
import { server } from '@personio-web/mocks/server';

import { renderHookWithWrapper } from '../../test-setup/testHelpers';
import { useGetPersonCardData } from './useGetPersonCardData';
import { PersonCardDataLoaderProvider } from './usePersonCardDataLoader';

describe('useGetPersonCardData', () => {
  const mockPersonId = '4';
  const mockAttributeIds = [
    PersonSystemAttribute.Position,
    PersonSystemAttribute.Department,
  ];

  const getContextWrapper =
    (attributeIds: PersonAttribute[] = mockAttributeIds) =>
    ({ children }: PropsWithChildren) =>
      (
        <PersonCardDataLoaderProvider attributeIds={attributeIds}>
          {children}
        </PersonCardDataLoaderProvider>
      );

  it('should return person and attributes data and be accessible', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    const { result } = renderHookWithWrapper(
      () =>
        useGetPersonCardData(mockPersonId, { attributeIds: mockAttributeIds }),
      {
        innerWrapper: getContextWrapper(),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.person?.id).toBe(mockPersonId);
    expect(result.current.isAccessible).toBe(true);
    expect(result.current.attributes).toEqual([
      {
        id: PersonSystemAttribute.Position,
        isNotVisible: false,
        label: 'Director, Product Design',
        value: 'Director, Product Design',
      },
      {
        id: PersonSystemAttribute.Department,
        isNotVisible: false,
        label: 'PTech',
        value: 6,
      },
    ]);
  });

  it('should return loading state for attributes and be accessible while loading', () => {
    server.use(listEmploymentsByPersonIdsHandlers.loadingHandler);
    const { result } = renderHookWithWrapper(
      () =>
        useGetPersonCardData(mockPersonId, { attributeIds: mockAttributeIds }),
      {
        innerWrapper: getContextWrapper(),
      },
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.isAccessible).toBe(true);
    expect(result.current.attributes).toEqual([
      { id: PersonSystemAttribute.Position, isLoading: true },
      { id: PersonSystemAttribute.Department, isLoading: true },
    ]);
  });

  it('should return undefined for attributes if attributeIds is empty and be accessible', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.defaultHandler);
    const { result } = renderHookWithWrapper(
      () => useGetPersonCardData(mockPersonId),
      {
        innerWrapper: getContextWrapper([]),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.person?.id).toBe(mockPersonId);
    expect(result.current.isAccessible).toBe(true);
    expect(result.current.attributes).toBeUndefined();
  });

  it('should return error state and be inaccessible', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.errorHandler);
    const { result } = renderHookWithWrapper(
      () =>
        useGetPersonCardData(mockPersonId, { attributeIds: mockAttributeIds }),
      {
        innerWrapper: getContextWrapper(),
      },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.person?.id).toBeUndefined();
    expect(result.current.isAccessible).toBe(false);
    expect(result.current.error).toStrictEqual(
      new ApolloError({ errorMessage: 'Server error' }),
    );
  });

  it('should return isAccessible as false if person preferredName is missing', async () => {
    server.use(listEmploymentsByPersonIdsHandlers.handlerWithoutPreferredName);

    const { result } = renderHookWithWrapper(
      () => useGetPersonCardData(mockPersonId, { attributeIds: [] }),
      { innerWrapper: getContextWrapper([]) },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.person?.id).toBe(mockPersonId);
    expect(result.current.isAccessible).toBe(false);
  });
});
