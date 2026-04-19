import { expect, test as base, type Page } from '@personio-web/playwright-e2e';

export type DepartmentsFixture = {
  departments: DepartmentsPage;
};

export const departmentsFixture = base.extend<DepartmentsFixture>({
  departments: async ({ page }, use) => {
    const departmentsPage = new DepartmentsPage(page);
    await use(departmentsPage);
  },
});

export class DepartmentsPage {
  readonly page: Page;
  readonly L1 = '01JZ0CVQB9DJS12PRTZVK09AGK';
  readonly L2 = '01JZ0D3WJ0DVNPA01QTB7J9EJ9';
  readonly L3 = '01JZ0D4NV8D8YV1TZD6WB15RVE';
  readonly L4 = '01JZ0D5S18DR36RWBAEEJF6D42';
  readonly L5 = '01JZ0D6DC7DCK3XWH634G2K4KR';
  readonly L6 = '01JZ0D7C5NDQ89VAND3HRMP5FM';
  readonly L7 = '01JZ0D8RQSDGCTKXNQ1FMDG27S';
  readonly L8 = '01JZ0DA0TQD691403T8P5MNQ3A';
  readonly L9 = '01JZ0DAF92DF4T8NKX25V4NPMV';
  readonly L10 = '01JZ0DAZ8SD5BQA2PT22VM8B8J';
  readonly ROOT = '01JZ0DG90MD77DVTVKQZ11375T';
  readonly ROOT_LEGACY_ID = '9777766';

  constructor(page: Page) {
    this.page = page;
  }

  async goToLayersManagement() {
    await this.page.goto('/organization/org-units/manage');
  }

  async goToDepartments() {
    await this.page.goto('/organization/org-units/departments');
  }

  async goToTeams() {
    await this.page.goto('/organization/org-units/teams');
  }

  async navigateToDepartments() {
    await this.navigateToSettings();
    await this.navigateToTeamsAndDepartments();
    await this.navigateToDepartmentsTab();
  }

  async navigateToTeams() {
    await this.navigateToSettings();
    await this.navigateToTeamsAndDepartments();
    await this.navigateToTeamsTab();
  }

  async navigateToLayersManagement() {
    await this.navigateToSettings();
    await this.navigateToTeamsAndDepartments();
    await this.navigateToManageTab();
  }

  async createDepartment(
    name: string,
    description?: string | undefined,
    resource?: string | undefined,
    abbreviation?: string | undefined,
    // Pass in an array of parentIds in case you want to add an OrgUnit to a nested parent deep in the hierarchy
    // If an array is passed, the last element will be the direct parentId of the new OrgUnit
    parentIds?: string | string[] | undefined,
    layerLevel?: number | undefined,
  ) {
    // Add new
    await this.page.getByTestId('add-new-button').waitFor();
    await this.page.getByTestId('add-new-button').click();

    // Form
    await expect(this.page.getByTestId('create-form')).toBeVisible();

    //create-form-name-field
    await this.page.getByTestId('create-form-name-field').fill(name);

    if (description) {
      await this.page
        .getByTestId('create-form-description-field')
        .fill(description);
    }

    if (resource) {
      await this.page
        .getByTestId('create-form-resource-uri-field')
        .fill(resource);
    }

    if (abbreviation) {
      await this.page
        .getByTestId('create-form-abbreviation-field')
        .fill(abbreviation);
    }

    if (parentIds || (Array.isArray(parentIds) && parentIds.length > 0)) {
      await this.page.getByTestId('create-form-parent-id-field-picker').click();

      if (typeof parentIds === 'string') {
        await this.page.click(`[id='${parentIds}']`);
      }

      if (Array.isArray(parentIds)) {
        for (let i = 0; i < parentIds.length - 1; i++) {
          const containerElement = this.page.locator(`[id='${parentIds[i]}']`);

          // The arrow button
          await containerElement.getByRole('button').first().click();
        }

        // Click the final parent node to select it
        const parentId = parentIds.at(-1);
        await this.page.click(`[id='${parentId}']`);
      }
    }

    if (layerLevel) {
      await this.page.getByTestId('edit-form-layer-level-field-picker').click();
      await this.page.click(`[id='${layerLevel}']`);
    }

    // Save
    await this.page.getByTestId('creation-dialog-save-button').click();
  }

  async updateSelectedDepartment(
    name?: string | undefined,
    description?: string | undefined,
    resource?: string | undefined,
    abbreviation?: string | undefined,
  ) {
    // Edit
    await this.page.getByTestId('edit-button').waitFor();
    await this.page.getByTestId('edit-button').click();

    // Form
    await expect(this.page.getByTestId('edit-form')).toBeVisible();

    if (name !== undefined) {
      await this.page.getByTestId('edit-form-name-field').fill(name);
    }

    if (description !== undefined) {
      await this.page
        .getByTestId('edit-form-description-field')
        .fill(description);
    }

    if (resource !== undefined) {
      await this.page
        .getByTestId('edit-form-resource-uri-field')
        .fill(resource);
    }

    if (abbreviation !== undefined) {
      await this.page
        .getByTestId('edit-form-abbreviation-field')
        .fill(abbreviation);
    }

    // Save
    await this.page.getByTestId('submit-changes-button').click();
  }

  async selectDepartment(id: string) {
    await this.page.locator(`[data-row-id="${id}"]`).waitFor();
    await this.page.click(`[data-row-id="${id}"]`);
  }

  async deleteSelectedDepartment() {
    // Edit
    await this.page.getByTestId('edit-button').waitFor();
    await this.page.getByTestId('edit-button').click();

    // Form
    await expect(this.page.getByTestId('edit-form')).toBeVisible();

    // Click delete
    await this.page.getByTestId('delete-button').click();

    // Confirm
    await this.page.getByTestId('confirm-delete-button').waitFor();
    await this.page.getByTestId('confirm-delete-button').click();
  }

  async validateSideDrawer(
    name = '-',
    description = 'Description not set',
    resource?: string | undefined,
    abbreviation = '-',
    parentName = '-',
  ) {
    // No data-test-id for name
    await this.page.getByRole('dialog').waitFor();
    await this.page.getByRole('heading', { level: 2, name }).waitFor();

    await expect(
      this.page.getByRole('heading', { level: 2, name }),
    ).toBeVisible();

    await expect(this.page.getByTestId('row-config-parent-id')).toContainText(
      parentName,
    );

    await expect(this.page.getByTestId('row-config-about')).toContainText(
      description,
    );

    // data-test-id is only set in the <a> element, so if it doesn't have a
    // value, there's nothing to validate against.
    if (resource !== undefined) {
      await expect(
        this.page.getByTestId('row-config-resource-url'),
      ).toContainText(resource);
    }

    await expect(
      this.page.getByTestId('row-config-abbreviation'),
    ).toContainText(abbreviation);
  }

  async validateTableListContains(text: string) {
    await this.page
      .getByTestId('org-units-table-table-body')
      .getByRole('row')
      .first()
      .waitFor(); // wait for the table with at least one row of data to be visible
    await expect(
      this.page.getByTestId('org-units-table-table-body'),
    ).toContainText(text);
  }

  async validateEditDepartmentDrawer(name: string) {
    await this.page.getByRole('dialog').waitFor();
    await expect(
      this.page.getByRole('heading', { name: 'Edit department' }),
    ).toBeVisible();
    await expect(this.page.getByTestId('edit-form-name-field')).toHaveValue(
      name,
    );
  }

  async navigateToSettings() {
    // Click on settings
    await this.page
      .getByTestId('navsidebar-settings')
      .waitFor({ state: 'visible' });

    await this.page.getByTestId('navsidebar-settings').click();
  }

  private async navigateToTeamsAndDepartments() {
    // Click on settings
    await this.page
      .getByTestId('settings-listitem-departments')
      .waitFor({ state: 'visible' });

    // Click on Teams & Departments
    await this.page.getByTestId('settings-listitem-departments').click();
  }

  private async navigateToDepartmentsTab() {
    await this.page
      .getByTestId('organization-tab-departments')
      .waitFor({ state: 'visible' });

    await this.page.getByTestId('organization-tab-departments').click();
  }

  private async navigateToTeamsTab() {
    await this.page
      .getByTestId('organization-tab-teams')
      .waitFor({ state: 'visible' });

    await this.page.getByTestId('organization-tab-teams').click();
  }

  private async navigateToManageTab() {
    await this.page
      .getByTestId('organization-tab-manage')
      .waitFor({ state: 'visible' });

    await this.page.getByTestId('organization-tab-manage').click();
  }
}
