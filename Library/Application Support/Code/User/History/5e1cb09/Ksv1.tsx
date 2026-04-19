import { renderHook } from '@testing-library/react';
// import { useRouter } from 'next/router';
import { useActiveLegalEntityId } from '../../hooks/useActiveLegalEntityId';
import mockRouter from 'next-router-mock';

jest.mock('next/router', () => require('next-router-mock'));
// jest.mock('next/router', () => ({
//   useRouter: jest.fn().mockReturnValue({
//     asPath: '?legalEntityId=123',
//     query: { legalEntityId: 123 },
//     replace: jest.fn(),
//   }),
// }));

describe('useActiveLegalEntityId', () => {
  it('should return the legalEntityId from the query', () => {
    mockRouter.replace('?legalEntityId=123');
    const mockLegalEntityId = '123';

    // (useRouter as jest.Mock).mockReturnValue({
    //   query: { legalEntityId: mockLegalEntityId },
    // });

    const { result } = renderHook(() => useActiveLegalEntityId());

    expect(result.current).toEqual(mockLegalEntityId);
  });
});
