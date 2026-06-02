import { test, expect, Page } from '@playwright/test';

// Wait for the loading skeleton to disappear (handles both fast and slow responses)
async function waitForResults(page: Page) {
  try {
    await page.waitForSelector('app-loading-skeleton', { state: 'detached', timeout: 15000 });
  } catch {
    // skeleton may not have appeared if the response was instant
  }
  // Wait for either the data table or the empty state to be visible
  await page.waitForSelector('table.users-table, app-empty-state', { timeout: 15000 });
}

test.describe('User Management — Main Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    await waitForResults(page);
  });

  test('should load the users list and show the table', async ({ page }) => {
    // Route title comes from users.routes.ts: title: 'Users'
    await expect(page).toHaveTitle(/Users/);
    await expect(page.locator('table.users-table')).toBeVisible();
    // Angular Material renders rows as <tr class="mat-mdc-row">
    await expect(page.locator('tr.mat-mdc-row').first()).toBeVisible();
    await expect(page.locator('mat-paginator')).toBeVisible();
  });

  test('should search for users by username', async ({ page }) => {
    await page.fill('input[aria-label="Search users"]', 'john');
    // Wait for debounce (300ms) + API
    await page.waitForTimeout(600);
    await waitForResults(page);

    const rows = page.locator('tr.mat-mdc-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter users by role', async ({ page }) => {
    // Open the dropdown first, then use Promise.all so waitForResponse
    // captures exactly the API call triggered by the option click
    await page.locator('mat-select[aria-label="Filter by role"]').click();

    await Promise.all([
      page.waitForResponse((r) => r.url().includes('/users'), { timeout: 10000 }),
      page.locator('mat-option').filter({ hasText: 'Admin' }).click(),
    ]);

    // Wait for at least one admin chip to appear (confirms filtered data is rendered)
    await expect(page.locator('.role-chip.role-admin').first()).toBeVisible({ timeout: 10000 });
    // Then verify no non-admin chips coexist
    await expect(page.locator('.role-chip:not(.role-admin)')).toHaveCount(0);

    // Stable snapshot — all visible chips should be admin
    const chips = await page.locator('.role-chip').all();
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      await expect(chip).toHaveText('admin');
    }
  });

  test('full flow: create user → view detail → edit → deactivate', async ({ page }) => {
    const username = `e2euser${Date.now()}`;

    // ── 1. CREATE ─────────────────────────────────────────────
    await page.click('a[aria-label="Create new user"]');
    await expect(page).toHaveURL(/\/users\/new/);

    // Use getByLabel — Angular Material connects mat-label via aria-labelledby
    await page.getByLabel('Username').fill(username);
    await page.getByLabel('Email').fill(`${username}@test.com`);
    await page.getByLabel('First Name').fill('E2E');
    await page.getByLabel('Last Name').fill('Tester');

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/users$/, { timeout: 10000 });
    await waitForResults(page);

    // ── 2. SEE IN LIST ────────────────────────────────────────
    const userRow = page.locator(`tr.mat-mdc-row:has(button:has-text("${username}"))`);
    await expect(userRow).toBeVisible();
    await expect(userRow.locator('.status-active')).toBeVisible();

    // ── 3. VIEW DETAIL ────────────────────────────────────────
    await userRow.locator(`button:has-text("${username}")`).click();
    await expect(page).toHaveURL(/\/users\/\d+$/);
    await expect(page.locator('mat-card-title')).toContainText('E2E Tester');
    await expect(page.locator('mat-card-subtitle')).toContainText(username);

    // ── 4. EDIT ───────────────────────────────────────────────
    await page.click('button[aria-label="Edit user"]');
    await expect(page).toHaveURL(/\/edit$/);

    // Wait for form pre-population (setInterval in ngOnInit patches the form)
    await expect(page.getByLabel('Username')).not.toHaveValue('', { timeout: 5000 });

    await page.getByLabel('First Name').fill('Edited');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/users$/, { timeout: 10000 });
    await waitForResults(page);

    // ── 5. DEACTIVATE ─────────────────────────────────────────
    const editedRow = page.locator(`tr.mat-mdc-row:has(button:has-text("${username}"))`);
    // Actions button has aria-label="Actions for <username>"
    await editedRow.locator(`button[aria-label="Actions for ${username}"]`).click();
    await page.locator('button[mat-menu-item]:has-text("Deactivate")').click();

    // Confirm in dialog — scope to dialog to avoid ambiguity with menu item
    const dialog = page.locator('mat-dialog-container');
    await dialog.getByRole('button', { name: 'Deactivate' }).click();

    // User should now show as inactive
    await expect(editedRow.locator('.status-inactive')).toBeVisible();
  });

  test('should open and cancel a delete confirmation dialog', async ({ page }) => {
    const firstRow = page.locator('tr.mat-mdc-row').first();
    const username = await firstRow.locator('button.username-link').innerText();

    await firstRow.locator(`button[aria-label="Actions for ${username.trim()}"]`).click();
    await page.locator('button[mat-menu-item]:has-text("Delete")').click();

    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('.mdc-dialog__title')).toHaveText('Delete User');

    // Use getByRole scoped to dialog to avoid strict mode violation
    await page.locator('mat-dialog-container').getByRole('button', { name: 'Cancel' }).click();
    await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  });
});
