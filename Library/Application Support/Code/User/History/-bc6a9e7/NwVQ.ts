// TODO: import type directly from the data module once [PAYME-331] is done
export type Employee = {
  employeeId: number;
  status: 'NEW' | 'ACTIVE' | 'EXCLUDED' | 'LEAVING' | 'INACTIVE';
  payGroupId: string;
  paygroupName: string;
  lastPayDate: string;
  nextPayDate: string;
};
