import { type FC, type RefObject } from 'react';

type TabContentComponentProps = {
  pageRef?: RefObject<HTMLDivElement>;
};

export type TabContentComponent: FC<TabContentComponentProps>
