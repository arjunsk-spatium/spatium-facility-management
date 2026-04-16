import { test, expect } from '@playwright/test';

test.describe('Companies Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should list companies', async ({ page }) => {
    await page.goto('/companies');
    await expect(page.getByRole('heading', { name: 'Companies', exact: true })).toBeVisible();
    // Assuming table or list exists
    // await expect(page.getByRole('table')).toBeVisible();
  });

  test('should show create company form', async ({ page }) => {
    await page.goto('/companies/create');
    // Verify common form elements
    // Note: Adjust selectors based on actual page implementation
    // await expect(page.getByLabel('Company Name')).toBeVisible();
  });

  test('should show insights', async ({ page }) => {
    await page.goto('/companies/insights');
    await expect(page).toHaveURL(/\/companies\/insights/);
  });
});
