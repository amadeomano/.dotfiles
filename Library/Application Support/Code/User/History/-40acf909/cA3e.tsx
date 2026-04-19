import { act, renderHook, render, waitFor } from '@testing-library/react';

import * as orgUnitsFeature from '@personio-web/employees-organizations-feature-org-units';
import { useOrgUnitDetailsState } from '@personio-web/employees-organizations-feature-org-units';
import { ListOrgUnitsHandlers } from '@personio-web/employees-organizations-gofer/mocking';
import { FeatureFlags } from '@personio-web/employees-organizations-util-org-units';
import { server } from '@personio-web/mocks/server';
import { DialogProvider } from '@personio-web/employees-organizations-hook-use-dialog-context';

import {
  TestWrapper,
  type TestWrapperProps,
} from '@personio-web/orchestrator-common/test-utils';
import { useOrgUnitDetailsDrawer } from './useOrgUnitDetailsDrawer';

const mockOrgUnitDetails = jest.spyOn(orgUnitsFeature, 'OrgUnitDetails');
const mockOrgUnitsEdit = jest.spyOn(orgUnitsFeature, 'OrgUnitsEdit');
const mockOrgUnitsDelete = jest.spyOn(orgUnitsFeature, 'OrgUnitsDelete');

const getWrapper =
  (props: TestWrapperProps) =>
  ({ children }: React.PropsWithChildren) => {
    return (
      <TestWrapper {...props}>
        <DialogProvider>{children}</DialogProvider>
      </TestWrapper>
    );
  };

describe('useOrgUnitDetailsDrawer', () => {
  it('should return correct state when dialog is open with valid org unit data', () => {
    const mockOrgUnitId = 1;
    const mockOrgUnitType = 'department';

    const { result } = renderHook(
      () => {
        const { state, setState } = useOrgUnitDetailsState();
        const orgUnitDrawer = useOrgUnitDetailsDrawer();

        return { state, setState, orgUnitDrawer };
      },
      { wrapper: getWrapper({}) },
    );

    act(() => {
      result.current.setState({
        orgUnitId: mockOrgUnitId,
        orgUnitType: mockOrgUnitType,
      });
    });

    expect(result.current.orgUnitDrawer.isOpen).toBe(true);
    expect(result.current.orgUnitDrawer.data).toEqual({
      orgUnitId: mockOrgUnitId,
      orgUnitType: mockOrgUnitType,
    });
    expect(result.current.orgUnitDrawer.Drawer).toBeDefined();
    expect(typeof result.current.orgUnitDrawer.close).toBe('function');

    act(() => {
      result.current.orgUnitDrawer.close();
    });

    expect(result.current.orgUnitDrawer.isOpen).toBe(false);
  });

  it('should return closed state when state is null', () => {
    const { result } = renderHook(
      () => {
        const orgUnitDrawer = useOrgUnitDetailsDrawer();
        return { orgUnitDrawer };
      },
      { wrapper: getWrapper({}) },
    );

    expect(result.current.orgUnitDrawer.isOpen).toBe(false);
    expect(result.current.orgUnitDrawer.data).toBeUndefined();
  });

  it('should handle state with view action', () => {
    const mockOrgUnitId = 1;
    const mockOrgUnitType = 'department';
    const mockAction = 'view';

    const { result } = renderHook(
      () => {
        const { setState } = useOrgUnitDetailsState();
        const orgUnitDrawer = useOrgUnitDetailsDrawer();
        return { setState, orgUnitDrawer };
      },
      { wrapper: getWrapper({}) },
    );

    act(() => {
      result.current.setState({
        orgUnitId: mockOrgUnitId,
        orgUnitType: mockOrgUnitType,
        action: mockAction,
      });
    });

    expect(result.current.orgUnitDrawer.isOpen).toBe(true);
    expect(result.current.orgUnitDrawer.data).toEqual({
      orgUnitId: mockOrgUnitId,
      orgUnitType: mockOrgUnitType,
      action: mockAction,
    });
  });

  it('should handle state with edit action', () => {
    const mockOrgUnitId = 1;
    const mockOrgUnitType = 'department';
    const mockAction = 'edit';

    const { result } = renderHook(
      () => {
        const { setState } = useOrgUnitDetailsState();
        const orgUnitDrawer = useOrgUnitDetailsDrawer();
        return { setState, orgUnitDrawer };
      },
      { wrapper: getWrapper({}) },
    );

    act(() => {
      result.current.setState({
        orgUnitId: mockOrgUnitId,
        orgUnitType: mockOrgUnitType,
        action: mockAction,
      });
    });

    expect(result.current.orgUnitDrawer.isOpen).toBe(true);
    expect(result.current.orgUnitDrawer.data).toEqual({
      orgUnitId: mockOrgUnitId,
      orgUnitType: mockOrgUnitType,
      action: mockAction,
    });
  });
});

describe('OrgUnitDetailsDrawer Component Rendering', () => {
  beforeEach(() => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when orgUnitId is missing', () => {
    const { result } = renderHook(() => useOrgUnitDetailsDrawer(), {
      wrapper: getWrapper({}),
    });

    const { container } = render(
      <result.current.Drawer orgUnitType="department" />,
      { wrapper: getWrapper({}) },
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should return null when orgUnitType is missing', () => {
    const { result } = renderHook(() => useOrgUnitDetailsDrawer(), {
      wrapper: getWrapper({}),
    });

    const { container } = render(<result.current.Drawer orgUnitId={1} />, {
      wrapper: getWrapper({}),
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should render OrgUnitDetails with correct props in view mode', async () => {
    const { result } = renderHook(() => useOrgUnitDetailsDrawer(), {
      wrapper: getWrapper({}),
    });

    render(
      <result.current.Drawer
        orgUnitId={1}
        orgUnitType="department"
        action="view"
      />,
      { wrapper: getWrapper({}) },
    );

    await waitFor(() => {
      expect(mockOrgUnitDetails).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          type: 'department',
          drawerConfig: expect.objectContaining({
            showParentOrgUnit: false,
            showSubOrgUnits: false,
            onEditClick: expect.any(Function),
            onDeleteClick: expect.any(Function),
            onCloseClick: expect.any(Function),
          }),
        }),
        expect.anything(),
      );
    });
  });

  it('should render OrgUnitEdit with correct props in edit mode', async () => {
    const { result } = renderHook(() => useOrgUnitDetailsDrawer(), {
      wrapper: getWrapper({
        features: {
          [FeatureFlags.ENABLE_GLOBAL_HIERARCHIES]: 'on',
          [FeatureFlags.ENABLE_LEADS]: 'on',
        },
      }),
    });

    render(
      <result.current.Drawer
        orgUnitId={1}
        orgUnitType="department"
        action="edit"
      />,
      {
        wrapper: getWrapper({
          features: {
            [FeatureFlags.ENABLE_GLOBAL_HIERARCHIES]: 'on',
            [FeatureFlags.ENABLE_LEADS]: 'on',
          },
        }),
      },
    );

    await waitFor(() => {
      expect(mockOrgUnitsEdit).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: '1',
          type: 'department',
          isGlobalHierarchiesEnabled: true,
          isLeadsEnabled: true,
          drawerConfig: {
            onEditSuccess: expect.any(Function),
            onEditCancel: expect.any(Function),
            onDeleteClick: expect.any(Function),
          },
        }),
        expect.anything(),
      );
    });
  });

  it('should render OrgUnitDelete with correct props in edit mode', async () => {
    const { result } = renderHook(() => useOrgUnitDetailsDrawer(), {
      wrapper: getWrapper({}),
    });

    render(
      <result.current.Drawer
        orgUnitId={1}
        orgUnitType="department"
        action="view"
      />,
      {
        wrapper: getWrapper({}),
      },
    );

    await waitFor(() => expect(mockOrgUnitDetails).toHaveBeenCalled());
    const props = mockOrgUnitDetails.mock.calls[0][0];
    props.drawerConfig?.onDeleteClick?.();

    await waitFor(() => {
      expect(mockOrgUnitsDelete).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: 1,
          type: 'department',
        }),
        expect.anything(),
      );
    });
  });
});
