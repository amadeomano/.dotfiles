import { type FC, type PropsWithChildren } from 'react';
import styles from './Header.module.scss';

type Props = { title: string };

export const Header: FC<PropsWithChildren<Props>> = ({ title, children }) => (
  <header>
    <h3>{title}</h3>
    <p className={styles.description}>{children}</p>
  </header>
);
