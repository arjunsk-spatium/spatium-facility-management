import { test, expect } from '@playwright/test';

test.describe('User Management Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should list users', async ({ page }) => {
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'User Module Management' })).toBeVisible();
  });
});
