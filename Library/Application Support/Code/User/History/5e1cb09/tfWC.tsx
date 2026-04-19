import { renderHook } from '@testing-library/react';
import { useActiveLegalEntityId } from '../../hooks/useActiveLegalEntityId';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));

describe('useActiveLegalEntityId', () => {
  it('should return the legalEntityId from the query', () => {
    mockRouter.replace('?legalEntityId=123');
    const mockLegalEntityId = '123';

    const { result } = renderHook(() => useActiveLegalEntityId());

    expect(result.current).toEqual(mockLegalEntityId);
  });
});
