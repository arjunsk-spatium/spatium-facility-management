import { test, expect } from '@playwright/test';

test.describe('Configuration Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should show configuration page', async ({ page }) => {
    await page.goto('/configure');
    await expect(page.getByRole('heading', { name: 'Configure' })).toBeVisible();
  });
});
