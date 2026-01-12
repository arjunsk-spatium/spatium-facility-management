import { test, expect } from '@playwright/test';

test.describe('SPOC Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show SPOC dashboard', async ({ page }) => {
    await page.goto('/spoc');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('should show employees list', async ({ page }) => {
    await page.goto('/spoc/employees');
    await expect(page.getByRole('heading', { name: 'Employees' })).toBeVisible();
  });

  test('should show visitor list', async ({ page }) => {
    await page.goto('/spoc/visitors');
    await expect(page.getByRole('heading', { name: 'Visitor List' })).toBeVisible();
  });

  test('should show visitor insights', async ({ page }) => {
    await page.goto('/spoc/visitors/insights');
    await expect(page).toHaveURL(/\/spoc\/visitors\/insights/);
  });

  test('should show invite visitor form', async ({ page }) => {
    await page.goto('/spoc/visitors/invite');
    await expect(page).toHaveURL(/\/spoc\/visitors\/invite/);
  });
});
