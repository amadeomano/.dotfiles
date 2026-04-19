type PayGroupProps = {
  name: string;
  employeeCount: number;
  faces: FacepileProps['items'];
};
const PayGroup = ({ name, employeeCount, faces }: PayGroupProps) => (
  <>
    <label>{name}</label>
    <Inline>
      <Facepile items={faces} totalItems={employeeCount} />
      <p>{employeeCount} People</p>
    </Inline>
  </>
);
