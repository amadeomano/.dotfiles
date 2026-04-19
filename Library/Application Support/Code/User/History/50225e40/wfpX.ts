import { useCallback, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useNodesInitialized } from 'reactflow';

export const useOnNodesInitialized = () => {
  const handlers = useRef<(() => void)[]>([]);
  const areNodesInitialised = useNodesInitialized({ includeHiddenNodes: true });

  const debouncedHandleInitChange = useCallback(
    debounce(() => {
      if (areNodesInitialised) handlers.current.forEach((handler) => handler());
    }, 500),
    [areNodesInitialised],
  );

  const addListener = useCallback((handler: () => void) => {
    handlers.current.push(handler);
    return () => {
      handlers.current = handlers.current.filter((hl) => hl !== handler);
    };
  }, []);

  useEffect(() => {
    debouncedHandleInitChange();
    return debouncedHandleInitChange.cancel;
  }, [areNodesInitialised]);

  // Empty handlers list when onmounting
  useEffect(() => {
    return () => {
      handlers.current = [];
    };
  }, []);

  return { addListener };
};
