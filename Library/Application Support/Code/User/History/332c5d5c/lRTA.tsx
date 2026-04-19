import { type FC, type PropsWithChildren } from 'react';
type Props = { title: string };

export const Header: FC<PropsWithChildren<Props>> = ({ title, children }) => (
  <header>
    <h3>{title}</h3>
    <p>{children}</p>
  </header>
);
