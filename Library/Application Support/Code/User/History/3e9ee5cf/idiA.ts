import { useState } from 'react';
import { toaster } from 'designSystem/component/toaster';

export const useAssignToPayGroup = () => {
  // TODO: remove state and call the API to assign the selected employees to the selected pay group
  const [isLoading, setIsLoading] = useState(false);

  const assignToPayGroup = (payGroupId: string, employeeIds: string[]) => {};

  return { assignToPayGroup };
};
