import { act, renderHook } from '@testing-library/react';
import { useScrolledPast } from './useScrolledPast';

const setBoundingClientRect = (element: HTMLElement, top: number) => {
  element.getBoundingClientRect = jest.fn(
    () =>
      ({
        top: top,
      } as DOMRect),
  );
};

describe('useScrolledPast', () => {
  describe('static target pixel', () => {
    it('should return false initially', () => {
      const anchorScrollRef = { current: document.createElement('div') };

      const { result } = renderHook(() =>
        useScrolledPast(anchorScrollRef, 100),
      );

      expect(result.current).toBe(false);
    });

    it('should return true when scrolled past the target pixel', () => {
      const anchorScrollRef = { current: document.createElement('div') };

      const { result } = renderHook(() =>
        useScrolledPast(anchorScrollRef, 100),
      );

      act(() => {
        anchorScrollRef.current.scrollTop = 150;
        anchorScrollRef.current.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe(true);
    });

    it('should return false when not scrolled past the target pixel', () => {
      const anchorScrollRef = { current: document.createElement('div') };

      const { result } = renderHook(() =>
        useScrolledPast(anchorScrollRef, 100),
      );

      act(() => {
        anchorScrollRef.current.scrollTop = 50;
        anchorScrollRef.current.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe(false);
    });
  });

  describe('dynamic target pixel', () => {
    it('should return false initially', () => {
      const anchorScrollRef = { current: document.createElement('div') };
      const scrollRef = { current: document.createElement('div') };
      setBoundingClientRect(anchorScrollRef.current, 0);
      setBoundingClientRect(scrollRef.current, 100);

      const { result } = renderHook(() =>
        useScrolledPast(anchorScrollRef, scrollRef),
      );

      expect(result.current).toBe(false);
    });

    it('should return true when scrolled past the target pixel', () => {
      const anchorScrollRef = { current: document.createElement('div') };
      const scrollRef = { current: document.createElement('div') };
      setBoundingClientRect(anchorScrollRef.current, 0);
      setBoundingClientRect(scrollRef.current, 100);

      const { result } = renderHook(() =>
        useScrolledPast(anchorScrollRef, scrollRef),
      );

      act(() => {
        anchorScrollRef.current.scrollTop = 150;
        anchorScrollRef.current.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe(true);
    });

    it('should return false when not scrolled past the target pixel', () => {
      const anchorScrollRef = { current: document.createElement('div') };
      const scrollRef = { current: document.createElement('div') };
      setBoundingClientRect(anchorScrollRef.current, 0);
      setBoundingClientRect(scrollRef.current, 100);

      const { result } = renderHook(() =>
        useScrolledPast(anchorScrollRef, scrollRef),
      );

      act(() => {
        anchorScrollRef.current.scrollTop = 50;
        anchorScrollRef.current.dispatchEvent(new Event('scroll'));
      });

      expect(result.current).toBe(false);
    });
  });
});
