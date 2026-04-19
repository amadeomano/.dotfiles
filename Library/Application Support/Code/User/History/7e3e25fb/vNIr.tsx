import { renderHook, waitFor } from '@testing-library/react';
import { usePanelTitle } from './usePanelTitle';

describe('usePanelTitle', () => {
  it('should return initial panel title as empty string when not scrolled', () => {
    const { result } = renderHook(() => usePanelTitle('Test Title'));

    expect(result.current.panelTitle).toBe('Test Title');
    expect(result.current.panelRef).toBeDefined();
  });

  it('should show title when scrolled past 70px threshold', async () => {
    const { result } = renderHook(() => usePanelTitle('My Panel Title'));

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      value: 0,
    });

    result.current.panelRef.current = mockDiv;
    // Simulate scrolling past the threshold
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      value: 71,
    });

    mockDiv.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(result.current.panelTitle).toBe('My Panel Title');
    });
  });

  it('should hide title when scrolled back to less than 70px', async () => {
    const { result } = renderHook(() => usePanelTitle('My Panel Title'));

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      value: 71,
    });

    (
      result.current.panelRef as React.MutableRefObject<HTMLDivElement>
    ).current = mockDiv;

    // First scroll past threshold
    mockDiv.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(result.current.panelTitle).toBe('My Panel Title');
    });

    // Then scroll back up
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      value: 50,
    });

    mockDiv.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(result.current.panelTitle).toBe('');
    });
  });

  it('should hide title when scroll position is exactly 70px', async () => {
    const { result } = renderHook(() => usePanelTitle('Test Title'));

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      value: 70,
    });

    (
      result.current.panelRef as React.MutableRefObject<HTMLDivElement>
    ).current = mockDiv;

    mockDiv.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(result.current.panelTitle).toBe('');
    });
  });

  it('should update title when title prop changes', async () => {
    const { result, rerender } = renderHook(
      ({ title }) => usePanelTitle(title),
      { initialProps: { title: 'Initial Title' } },
    );

    expect(result.current.panelTitle).toBe('Initial Title');

    const mockDiv = document.createElement('div');
    Object.defineProperty(mockDiv, 'scrollTop', {
      writable: true,
      value: 71,
    });

    (
      result.current.panelRef as React.MutableRefObject<HTMLDivElement>
    ).current = mockDiv;

    mockDiv.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(result.current.panelTitle).toBe('Initial Title');
    });

    // Change the title prop
    rerender({ title: 'Updated Title' });

    await waitFor(() => {
      expect(result.current.panelTitle).toBe('Updated Title');
    });
  });

  it('should handle undefined panelRef gracefully', () => {
    const { result } = renderHook(() => usePanelTitle('Test Title'));

    // Don't assign anything to the ref, it should remain undefined
    expect(() => result.current.panelRef).not.toThrow();
    expect(result.current.panelTitle).toBe('Test Title');
  });

  it('should handle event listener cleanup on unmount', () => {
    const { result, unmount } = renderHook(() => usePanelTitle('Test Title'));

    const mockDiv = document.createElement('div');

    (
      result.current.panelRef as React.MutableRefObject<HTMLDivElement>
    ).current = mockDiv;

    // Unmount should not throw
    expect(() => unmount()).not.toThrow();
  });
});
