import { renderHook, act } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';
import { useLegalEntitiesNavigator } from './useLegalEntityNavigator';

jest.mock('next/router', () => require('next-router-mock'));

describe('useLegalEntitiesNavigator', () => {
  it('should return undefined if no legal entity is active', () => {
    mockRouter.setCurrentUrl('');
    const { result } = renderHook(() => useLegalEntitiesNavigator());
    expect(result.current.getActiveLegalEntity()).toBeUndefined();
  });

  it('should return the active legal entity if it exists', () => {
    mockRouter.setCurrentUrl('?le=1');
    const { result } = renderHook(() => useLegalEntitiesNavigator());
    expect(result.current.getActiveLegalEntity()).toBe('entity1');
  });

  it('should return the first active legal entity if multiple exist', () => {
    mockRouter.setCurrentUrl('?le=entity1&le=entity2');
    const { result } = renderHook(() => useLegalEntitiesNavigator());
    expect(result.current.getActiveLegalEntity()).toBe('entity1');
  });

  it('should navigate to a new legal entity if it is different from the current one', () => {
    mockRouter.setCurrentUrl('?le=1');
    const { result } = renderHook(() => useLegalEntitiesNavigator());
    act(() => {
      result.current.navigateToLegalEntity('2');
    });
    expect(mockRouter.query.le).toBe('2');
  });

  it('should not navigate if the legal entity is the same as the current one', () => {
    mockRouter.query = { le: 'entity1' };
    const { result } = renderHook(() => useLegalEntitiesNavigator());
    act(() => {
      result.current.navigateToLegalEntity('entity1');
    });
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
