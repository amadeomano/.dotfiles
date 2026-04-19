import { renderHook, act } from '@testing-library/react-hooks';
import mockRouter from 'next-router-mock';
import { useLegalEntitiesPicker } from './useLegalEntitiesPicker';
import { useLegalEntities } from '../useLegalEntities';
import { useLegalEntitiesNavigator } from '../navigators/useLegalEntityNavigator';

jest.mock('next/router', () => require('next-router-mock'));

jest.mock('../useLegalEntities');

describe('useLegalEntitiesPicker', () => {
  const mockLegalEntities = {
    1: { id: '1', name: 'Entity One' },
    2: { id: '2', name: 'Entity Two' },
  };

  const mockGetActiveLegalEntity = jest.fn();
  const mockNavigateToLegalEntity = jest.fn();

  beforeEach(() => {
    (useLegalEntities as jest.Mock).mockReturnValue({
      legalEntities: mockLegalEntities,
    });
    (useLegalEntitiesNavigator as jest.Mock).mockReturnValue({
      getActiveLegalEntity: mockGetActiveLegalEntity,
      navigateToLegalEntity: mockNavigateToLegalEntity,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of legal entities', () => {
    const { result } = renderHook(() => useLegalEntitiesPicker());

    expect(result.current.list).toEqual([
      { key: '1', label: 'Entity One' },
      { key: '2', label: 'Entity Two' },
    ]);
  });

  it('should return the active legal entity', () => {
    mockGetActiveLegalEntity.mockReturnValue('1');
    const { result } = renderHook(() => useLegalEntitiesPicker());

    expect(result.current.selected).toBe('1');
  });

  it('should return an empty string if no active legal entity', () => {
    mockGetActiveLegalEntity.mockReturnValue(null);
    const { result } = renderHook(() => useLegalEntitiesPicker());

    expect(result.current.selected).toBe('');
  });

  it('should call navigateToLegalEntity when onSelect is called', () => {
    const { result } = renderHook(() => useLegalEntitiesPicker());

    act(() => {
      result.current.onSelect('2');
    });

    expect(mockNavigateToLegalEntity).toHaveBeenCalledWith('2');
  });

  it('should return the correct placeholder', () => {
    const { result } = renderHook(() => useLegalEntitiesPicker());

    expect(result.current.placeholder).toBe('Select a Legal Entity');
  });
});
