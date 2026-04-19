type Props = {
  title: string;
  description: string;
};

export const Header = ({ title, description }: Props) => (
  <>
    <h3>{title}</h3>
    <p>{description}</p>
  </>
);
