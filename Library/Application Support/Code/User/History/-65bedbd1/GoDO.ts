import { ListOrgUnitsHandlers } from '@personio-web/employees-organizations-gofer/mocking';
import { stratify } from '@personio-web/employees-organizations-hook-use-hierarchical-data';
import { type HierarchicalOrgUnitGofer } from '@personio-web/employees-organizations-hook-use-query-org-units';
import { departmentsMock } from '@personio-web/employees-organizations-mocks-org-units';
import { PersonSystemAttribute } from '@personio-web/employees-organizations-util-people';
import { server } from '@personio-web/mocks/server';

import { createOrgUnitsFilterConfig } from './createOrgUnitsFilterConfig';

const [departments] = stratify(departmentsMock);

describe('createMultiSelectFilterConfig', () => {
  it('should return config for attribute', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);

    const attributeId = PersonSystemAttribute.Department;

    const result = createOrgUnitsFilterConfig(
      attributeId,
      false,
      'empty',
      undefined,
      ['contains'],
      departments as unknown as HierarchicalOrgUnitGofer[],
    );

    expect(result).toEqual({
      columnId: attributeId,
      field: 'multiselect',
      conditions: ['contains'],
      getOptions: expect.any(Function),
    });

    const rootDepartments = departmentsMock.filter(
      (department) => !department.parent_id,
    );

    await expect(result.getOptions?.()).resolves.toHaveLength(
      rootDepartments.length,
    );
  });

  it('should include empty option for attribute', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);
    const attributeId = PersonSystemAttribute.Department;

    const result = createOrgUnitsFilterConfig(
      attributeId,
      true,
      'empty',
      undefined,
      ['contains'],
      departments as unknown as HierarchicalOrgUnitGofer[],
    );

    expect(result).toEqual({
      columnId: attributeId,
      field: 'multiselect',
      conditions: ['contains'],
      getOptions: expect.any(Function),
    });

    const rootDepartments = departmentsMock.filter(
      (department) => !department.parent_id,
    );

    await expect(result.getOptions?.()).resolves.toHaveLength(
      rootDepartments.length + 1,
    );

    await expect(result.getOptions?.()).resolves.toContainEqual({
      id: '',
      label: 'empty',
      value: '',
    });
  });

  it('should execute the select callback on the filtered options', async () => {
    server.use(ListOrgUnitsHandlers.defaultHandler);

    const attributeId = PersonSystemAttribute.Department;
    const mockSelect = jest.fn((options) => options);

    const result = createOrgUnitsFilterConfig(
      attributeId,
      false,
      'empty',
      mockSelect,
      ['contains'],
      departments as unknown as HierarchicalOrgUnitGofer[],
    );

    expect(result).toEqual({
      columnId: attributeId,
      field: 'multiselect',
      conditions: ['contains'],
      getOptions: expect.any(Function),
    });

    await expect(result.getOptions?.()).resolves.toBeTruthy();

    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('should return empty array if none is returned', async () => {
    server.use(ListOrgUnitsHandlers.emptyHandler);

    const attributeId = PersonSystemAttribute.Team;

    const result = createOrgUnitsFilterConfig(
      attributeId,
      false,
      'empty',
      undefined,
      ['contains'],
      [],
    );

    expect(result).toEqual({
      columnId: attributeId,
      field: 'multiselect',
      conditions: ['contains'],
      getOptions: expect.any(Function),
    });

    await expect(result.getOptions?.()).resolves.toHaveLength(0);
  });

  it('should return array of one empty item if none is returned and allowed empty was passed', async () => {
    server.use(ListOrgUnitsHandlers.emptyHandler);

    const attributeId = PersonSystemAttribute.Team;
    const result = createOrgUnitsFilterConfig(
      attributeId,
      true,
      'empty',
      undefined,
      ['contains'],
      [],
    );

    expect(result).toEqual({
      columnId: attributeId,
      field: 'multiselect',
      conditions: ['contains'],
      getOptions: expect.any(Function),
    });

    await expect(result.getOptions?.()).resolves.toEqual([
      {
        id: '',
        value: '',
        label: 'empty',
      },
    ]);
  });
});
