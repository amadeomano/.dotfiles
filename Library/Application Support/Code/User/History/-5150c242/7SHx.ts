import { renderHook } from '@testing-library/react';
import { useApprovePayrollRunActions } from './useApprovePayrollRunActions';
import { PAYRUN_MOCK } from '../../../../../__mocks__/Payruns';
import { QueryWrapper } from '../../../../../../testSetup/testHelpers';
import { act } from '@testing-library/react-hooks';

describe('useApprovePayrollRunActions', () => {
  test('should update isApprovePayrunDialogOpen correctly', () => {
    const { result } = renderHook(
      () => useApprovePayrollRunActions(PAYRUN_MOCK[0]),
      { wrapper: QueryWrapper },
    );

    act(() => result.current.primaryAction.onClick());

    expect(result.current.isApprovePayrunDialogOpen).toBe(true);
    expect(result.current.primaryAction.isVisible).toBe(false);

    act(() => result.current.onClose());

    expect(result.current.isApprovePayrunDialogOpen).toBe(false);
  });

  test('should return a correct isVisible for the primaryAction', () => {
    const { result } = renderHook(
      () => useApprovePayrollRunActions({ ...PAYRUN_MOCK[0], status: 'DRAFT' }),
      { wrapper: QueryWrapper },
    );

    expect(result.current.primaryAction.isVisible).toBe(true);
  });
});
