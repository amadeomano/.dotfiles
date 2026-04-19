import { expect, flow } from '@personio-web/playwright-e2e';
import { departmentsFixture as test } from '../../fixtures/departments';

// type guard function to assert that a value is defined
function assertDefined<T>(
  value: T | undefined,
  message: string,
): asserts value is T {
  expect(value, message).toBeDefined();
}

test.use({ baseURL: 'https://synthetics-monitoring-eo.app.personio.com' });
flow(
  {
    id: 'teams-and-departments-hierarchical-changes-5a0e2514fa',
    serviceNames: ['person-and-employment-service'],
    owners: ['os'],
  },
  () => {
    const idsToCleanUp: string[] = [];

    test.afterAll(async ({ page, auth, departments }) => {
      await auth.login();
      await departments.goToDepartments();

      for (const id of idsToCleanUp.sort((a, b) => Number(b) - Number(a))) {
        await page.goto(`/organization/org-units/departments/details/${id}`);

        const notFound = page.getByTestId('org-unit-details-not-found-state');
        const found = page.getByTestId('edit-button');

        await notFound.or(found).waitFor();

        const departmentNotFound = await notFound.isVisible();

        if (departmentNotFound) {
          continue;
        }

        await departments.deleteSelectedDepartment();
      }
    });

    test('create-org-unit-with-existing-parent', async ({
      page,
      auth,
      departments,
    }) => {
      await auth.login();
      await departments.goToDepartments();

      const dateString = new Date().toISOString();
      const name = '[E2E][HIERARCHICAL] ' + dateString;

      await departments.createDepartment(
        name,
        undefined,
        undefined,
        undefined,
        departments.ROOT,
      );
      await page.waitForURL(
        /\/organization\/org-units\/departments\/details\/\d+/,
      );
      idsToCleanUp.push(page.url().split('/').pop() || ''); // add to cleanup list 1st
      await departments.validateTableListContains(name);

      const href = await page
        .getByTestId('row-config-parent-id')
        .getAttribute('href');
      expect(href).toContain(departments.ROOT_LEGACY_ID);

      await departments.deleteSelectedDepartment();
      await expect(
        page.getByTestId('org-units-table-table-body'),
      ).not.toContainText(name);
    });

    test(`cannot-create-org-unit-over-max-depth`, async ({
      page,
      auth,
      departments,
    }) => {
      await auth.login();
      await departments.goToDepartments();
      await expect(
        page.getByTestId('org-units-table-table-body'),
      ).toBeVisible();

      const dateString = new Date().toISOString();
      const name = '[E2E][HIERARCHICAL] ' + dateString;
      const parentUlids = [
        departments.L1,
        departments.L2,
        departments.L3,
        departments.L4,
        departments.L5,
        departments.L6,
        departments.L7,
        departments.L8,
        departments.L9,
        departments.L10,
      ];

      await expect(
        page.locator('[id="org-units-picker-error-text"]'),
      ).toBeHidden();
      await departments.createDepartment(
        name,
        undefined,
        undefined,
        undefined,
        parentUlids,
      );
      await expect(
        page.locator('[id="org-units-picker-error-text"]'),
      ).toBeVisible();
      await expect(
        page.getByTestId('org-units-table-table-body'),
      ).not.toContainText(name);
    });

    test(`create-org-unit-with-hierarchy-then-split`, async ({
      page,
      auth,
      departments,
    }) => {
      await auth.login();
      await departments.goToDepartments();
      await expect(
        page.getByTestId('org-units-table-table-body'),
      ).toBeVisible();

      const newOrgUnits: { id: string; name: string }[] = [];
      const now = new Date().toISOString();

      for (let i = 0; i < 3; i++) {
        const name = `[E2E][HIERARCHICAL-SPLIT][OrgUnit ${i + 1}] ${now}`;

        await departments.createDepartment(
          name,
          undefined,
          undefined,
          undefined,
          undefined,
          i + 1,
        );

        // Wait for the dialog's heading of the new org unit to be visible
        await page.getByRole('heading', { level: 2, name }).waitFor();

        const id = page.url().split('/').pop();
        assertDefined(id, 'No org id found on create department');
        idsToCleanUp.push(id); // add the id to the list of ids to clean up first

        await departments.validateTableListContains(name);
        newOrgUnits.push({ id, name });
      }

      // Select middle org unit
      const middleOrgUnit = newOrgUnits[1];

      await departments.selectDepartment(middleOrgUnit.id);
      await departments.validateSideDrawer(middleOrgUnit.name);
      await page.getByTestId('edit-button').click();
      await page.waitForURL(
        `/organization/org-units/departments/edit/${middleOrgUnit.id}`,
      );
      await departments.validateEditDepartmentDrawer(middleOrgUnit.name);

      await page.getByTestId('edit-form-parent-id-field-picker').click();
      await page.getByLabel('Clear all').click();
      await page.getByTestId('edit-form-parent-id-field-picker').click();
      await page.getByTestId('submit-changes-button').click();
      await page.getByTestId('confirm-changes-button').click();

      await page
        .getByRole('heading', { level: 2, name: middleOrgUnit.name })
        .waitFor();

      // Close the edit dialog before selecting the new org unit
      await page
        .getByRole('dialog')
        .getByRole('button', { name: 'Close' })
        .click();
      await expect(page.getByRole('dialog')).toBeHidden();

      await departments.selectDepartment(newOrgUnits[0].id);
      await departments.validateSideDrawer(
        newOrgUnits[0].name,
        undefined,
        undefined,
        '-',
        '-',
      );

      await departments.selectDepartment(newOrgUnits[1].id);
      await departments.validateSideDrawer(
        newOrgUnits[1].name,
        undefined,
        undefined,
        '-',
        '-',
      );

      await departments.selectDepartment(newOrgUnits[2].id);
      await departments.validateSideDrawer(
        newOrgUnits[2].name,
        undefined,
        undefined,
        '-',
        newOrgUnits[1].name,
      );

      await page.goto(
        `/organization/org-units/departments/details/${newOrgUnits[0].id}`,
      );
      await departments.deleteSelectedDepartment();

      await page.goto(
        `/organization/org-units/departments/details/${newOrgUnits[2].id}`,
      );
      await departments.deleteSelectedDepartment();

      await page.goto(
        `/organization/org-units/departments/details/${newOrgUnits[1].id}`,
      );
      await departments.deleteSelectedDepartment();
    });
  },
);
