import { type RefObject, useEffect, useRef, useState } from 'react';

/**
 *
 * @param anchorScrollRef the ref of the parent/surrounding element, e.g. the page itself
 * @param scrollRef the ref of the element which we want to evaluate for if we have scrolled past it
 * @returns
 */
export function useScrolledPast(
  anchorScrollRef: RefObject<HTMLDivElement>,
  scrollRef: RefObject<HTMLDivElement> | number,
) {
  // TODO: once <PageHierarchical.LayoutFullWidth supports passing elements for the title prop, we can evaluate switching to use IntersectionObserver instead
  const [scrolledPast, setScrolledPast] = useState<boolean>(false);
  const targetPixel = useRef<number>();

  useEffect(() => {
    const scrollListener = () => {
      const scrollTop = anchorScrollRef.current?.scrollTop;

      if (scrollTop && targetPixel.current && scrollTop > targetPixel.current) {
        setScrolledPast(true);
      } else {
        setScrolledPast(false);
      }
    };

    const tmpScrollRef = anchorScrollRef?.current;

    tmpScrollRef?.addEventListener('scroll', scrollListener);
    return () => {
      tmpScrollRef?.removeEventListener('scroll', scrollListener);
    };
  }, [anchorScrollRef]);

  useEffect(() => {
    // dynamically set the target pixel which is the threshold for having "scrolled past" the respective element
    if (typeof scrollRef === 'number') targetPixel.current = scrollRef;
    else if (anchorScrollRef.current && scrollRef.current) {
      targetPixel.current =
        scrollRef.current.getBoundingClientRect().top -
        anchorScrollRef.current.getBoundingClientRect().top;
    }
  }, [anchorScrollRef, scrollRef]);

  return scrolledPast;
}
