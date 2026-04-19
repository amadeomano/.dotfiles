import {
  forwardRef,
  type MutableRefObject,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import classnames from 'classnames';

import { useFeatureFlag } from '@personio-web/use-feature-flag-wrapper';

import { viewportPadding } from '../TreeLayout/constants';

import styles from './Viewport.module.scss';

interface ViewportProps {
  children: React.ReactNode;
}

export const Viewport = forwardRef<HTMLDivElement | null, ViewportProps>(
  ({ children }, ref) => {
    const { isOn, isReady } = useFeatureFlag(
      FeatureFlags.ENABLE_REDESIGN_ORG_CHART_CONTROLBAR,
    );
    const isActionBarRedesignEnabled = isOn && isReady;

    const viewport = useRef<HTMLDivElement | null>(null);
    const [viewportTop, setViewportTop] = useState(0);

    const viewportRefCallback = useCallback((node: HTMLDivElement | null) => {
      if (node) {
        (viewport as MutableRefObject<HTMLDivElement>).current = node;
        setViewportTop(node.getBoundingClientRect().top + viewportPadding);
      }
    }, []);

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
      ref,
      () => viewport.current,
    );

    return (
      <div
        ref={viewportRefCallback}
        className={styles.viewport}
        style={{
          height: `calc(100vh - ${viewportTop}px)`,
        }}
      >
        {children}
      </div>
    );
  },
);
