import { type PropsWithMetadata } from '@highlight-ui/utils-commons';
import { type FC, type PropsWithChildren } from 'react';
type Props = {
  title: string;
  description: string;
};

export const Header: FC<PropsWithMetadata<Props>> = ({
  title,
  description,
}) => (
  <>
    <h3>{title}</h3>
    <p>{description}</p>
  </>
);
