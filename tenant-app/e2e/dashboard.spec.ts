import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should render dashboard widgets', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    
    // Check for main sections
    await expect(page.getByRole('heading', { name: 'Companies' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Visitors' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Facilities' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Helpdesk' })).toBeVisible();
  });
});
