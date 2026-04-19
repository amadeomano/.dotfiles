// TODO: import type directly from the data module once [PAYME-331] is done
type Employee = {
  employeeId: number;
  firstName: string;
  lastName: string;
  status: 'NEW' | 'ACTIVE' | 'EXCLUDED' | 'LEAVING' | 'INACTIVE';
  payGroupId: string;
  paygroupName: string;
  lastPayDate: Date;
  nextPayDate: Date;
  avatar: string;
};
