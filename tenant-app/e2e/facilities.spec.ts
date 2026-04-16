import { test, expect } from '@playwright/test';

test.describe('Facilities Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should list facilities', async ({ page }) => {
    await page.goto('/facilities');
    await expect(page.getByRole('heading', { name: 'Facilities' })).toBeVisible();
  });

  test('should show create facility form', async ({ page }) => {
    await page.goto('/facilities/create');
    await expect(page).toHaveURL(/\/facilities\/create/);
  });

  test('should show insights', async ({ page }) => {
    await page.goto('/facilities/insights');
    await expect(page).toHaveURL(/\/facilities\/insights/);
  });
});
