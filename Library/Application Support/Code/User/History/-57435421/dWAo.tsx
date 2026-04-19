import { Inline } from 'designSystem/component/layout';
import { type FacepileProps, Facepile } from 'designSystem/component/facepile';

type PayGroupProps = {
  name: string;
  employeeCount: number;
  faces: FacepileProps['items'];
};
export const PayGroup = ({ name, employeeCount, faces }: PayGroupProps) => (
  <>
    <label>{name}</label>
    <Inline>
      <Facepile items={faces} totalItems={employeeCount} />
      <p>{employeeCount} People</p>
    </Inline>
  </>
);
