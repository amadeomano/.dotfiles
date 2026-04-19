import { renderHook, act } from '@testing-library/react';
import { usePanelTitle } from './usePanelTitle';

type PanelRef = React.MutableRefObject<HTMLDivElement>;

describe('usePanelTitle', () => {
  it('should return initial panel title as empty string when not scrolled', () => {
    const { result } = renderHook(() => usePanelTitle('Test Title'));

    expect(result.current.panelTitle).toBe('');
    expect(result.current.panelRef).toBeDefined();
  });

  it('should show title when scrolled past 70px threshold', () => {
    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    });

    const { result } = renderHook(() => {
      const hookResult = usePanelTitle('My Panel Title');
      (hookResult.panelRef as PanelRef).current = mockDiv;
      return hookResult;
    });

    act(() => {
      Object.defineProperty(mockDiv, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 71,
      });
      mockDiv.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.panelTitle).toBe('My Panel Title');
  });

  it('should hide title when scrolled back to less than 70px', () => {
    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 71,
    });

    const { result } = renderHook(() => {
      const hookResult = usePanelTitle('My Panel Title');
      // Assign the mock div during render so the effect can attach to it
      (hookResult.panelRef as PanelRef).current = mockDiv;
      return hookResult;
    });

    act(() => {
      mockDiv.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.panelTitle).toBe('My Panel Title');

    act(() => {
      Object.defineProperty(mockDiv, 'scrollTop', {
        writable: true,
        configurable: true,
        value: 50,
      });
      mockDiv.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.panelTitle).toBe('');
  });
});
