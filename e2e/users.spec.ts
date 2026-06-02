import { test, expect, Page } from '@playwright/test';

// Waits for the users table to finish loading
async function waitForTable(page: Page) {
  await page.waitForSelector('table.users-table', { timeout: 15000 });
  await page.waitForSelector('app-loading-skeleton', { state: 'detached', timeout: 15000 });
}

test.describe('User Management — Main Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    await waitForTable(page);
  });

  test('should load the users list and show the table', async ({ page }) => {
    await expect(page).toHaveTitle(/User Management/);
    await expect(page.locator('table.users-table')).toBeVisible();
    await expect(page.locator('mat-row').first()).toBeVisible();
    // Paginator should be present
    await expect(page.locator('mat-paginator')).toBeVisible();
  });

  test('should search for users by username', async ({ page }) => {
    await page.fill('input[aria-label="Search users"]', 'john');
    // Wait for debounce (300ms) + API response
    await page.waitForTimeout(600);
    await waitForTable(page);

    const rows = page.locator('mat-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter users by role', async ({ page }) => {
    await page.locator('mat-select[aria-label="Filter by role"]').click();
    await page.locator('mat-option').filter({ hasText: 'Admin' }).click();
    await waitForTable(page);

    const roleChips = page.locator('.role-chip');
    const count = await roleChips.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(roleChips.nth(i)).toHaveText('admin');
    }
  });

  test('full flow: create user → view detail → edit → deactivate', async ({ page }) => {
    const username = `e2euser${Date.now()}`;

    // ── 1. CREATE ─────────────────────────────────────────────
    await page.click('a[aria-label="Create new user"]');
    await expect(page).toHaveURL(/\/users\/new/);

    await page.fill('input[formcontrolname="username"]', username);
    await page.fill('input[formcontrolname="email"]', `${username}@test.com`);
    await page.fill('input[formcontrolname="first_name"]', 'E2E');
    await page.fill('input[formcontrolname="last_name"]', 'Tester');

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/users$/, { timeout: 10000 });
    await waitForTable(page);

    // ── 2. SEE IN LIST ────────────────────────────────────────
    const userRow = page.locator(`tr:has(button:has-text("${username}"))`);
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

    await page.fill('input[formcontrolname="first_name"]', 'Edited');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/users$/, { timeout: 10000 });
    await waitForTable(page);

    // ── 5. DEACTIVATE ─────────────────────────────────────────
    const editedRow = page.locator(`tr:has(button:has-text("${username}"))`);
    await editedRow.locator('button[mat-icon-button]').click();
    await page.locator('button[mat-menu-item]:has-text("Deactivate")').click();

    // Confirm in dialog
    await page.locator('.mat-mdc-dialog-actions button[color="warn"]').click();

    // User should now be inactive
    await expect(editedRow.locator('.status-inactive')).toBeVisible();
  });

  test('should open and cancel a delete confirmation dialog', async ({ page }) => {
    const firstRowMenu = page.locator('tr[mat-row]').first().locator('button[mat-icon-button]');
    await firstRowMenu.click();

    await page.locator('button[mat-menu-item]:has-text("Delete")').click();
    await expect(page.locator('mat-dialog-container')).toBeVisible();
    await expect(page.locator('.mdc-dialog__title')).toHaveText('Delete User');

    // Cancel — row should still be there
    await page.locator('.mat-mdc-dialog-actions button:not([color])').click();
    await expect(page.locator('mat-dialog-container')).not.toBeVisible();
  });
});
