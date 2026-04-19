import { renderHook, act } from '@testing-library/react';
import { usePanelTitle } from './usePanelTitle';

describe('usePanelTitle', () => {
  it('should return initial panel title as empty string when not scrolled', () => {
    const { result } = renderHook(() => usePanelTitle('Test Title'));

    expect(result.current.panelTitle).toBe('');
    expect(result.current.panelRef).toBeDefined();
  });

  it('should show title when scrolled past 70px threshold', () => {
    const { result, rerender } = renderHook(() =>
      usePanelTitle('My Panel Title'),
    );

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    });

    act(() => {
      (result.current.panelRef as any).current = mockDiv;
    });
    rerender();

    // Now scroll past the threshold
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
    const { result, rerender } = renderHook(() =>
      usePanelTitle('My Panel Title'),
    );

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 71,
    });

    // Attach ref and rerender
    act(() => {
      (
        result.current.panelRef as React.MutableRefObject<HTMLDivElement>
      ).current = mockDiv;
    });
    rerender();

    // Scroll to trigger title display
    act(() => {
      mockDiv.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.panelTitle).toBe('My Panel Title');

    // Scroll back up
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

  it('should hide title when scroll position is exactly 70px', () => {
    const { result, rerender } = renderHook(() => usePanelTitle('Test Title'));

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 70,
    });

    act(() => {
      (
        result.current.panelRef as React.MutableRefObject<HTMLDivElement>
      ).current = mockDiv;
    });
    rerender();

    act(() => {
      mockDiv.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.panelTitle).toBe('');
  });

  it('should update title when title prop changes', () => {
    const { result, rerender } = renderHook(
      ({ title }) => usePanelTitle(title),
      { initialProps: { title: 'Initial Title' } },
    );

    expect(result.current.panelTitle).toBe('');

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 71,
    });

    act(() => {
      (
        result.current.panelRef as React.MutableRefObject<HTMLDivElement>
      ).current = mockDiv;
    });
    rerender({ title: 'Initial Title' });

    act(() => {
      mockDiv.dispatchEvent(new Event('scroll'));
    });

    expect(result.current.panelTitle).toBe('Initial Title');

    // Change the title prop
    rerender({ title: 'Updated Title' });

    expect(result.current.panelTitle).toBe('Updated Title');
  });

  it('should handle undefined panelRef gracefully', () => {
    const { result } = renderHook(() => usePanelTitle('Test Title'));

    // Don't assign anything to the ref, it should remain undefined
    expect(() => result.current.panelRef).not.toThrow();
    expect(result.current.panelTitle).toBe('');
  });

  it('should handle event listener cleanup on unmount', () => {
    const { result, rerender, unmount } = renderHook(() =>
      usePanelTitle('Test Title'),
    );

    const mockDiv = document.createElement('div');

    act(() => {
      (
        result.current.panelRef as React.MutableRefObject<HTMLDivElement>
      ).current = mockDiv;
    });
    rerender();

    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });
});
