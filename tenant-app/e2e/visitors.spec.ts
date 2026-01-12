import { test, expect } from '@playwright/test';

test.describe('Visitors Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should list visitors', async ({ page }) => {
    await page.goto('/visitors');
    await expect(page.getByRole('heading', { name: 'Visitors' })).toBeVisible();
  });

  test('should show insights', async ({ page }) => {
    await page.goto('/visitors/insights');
    await expect(page).toHaveURL(/\/visitors\/insights/);
  });
});
