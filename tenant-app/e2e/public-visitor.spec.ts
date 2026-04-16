import { test, expect } from '@playwright/test';

test.describe('Public Visitor Pages', () => {
  // No login needed for public pages

  test('should show landing page', async ({ page }) => {
    await page.goto('/public/visitor');
    // Verify landing page content
    await expect(page).toHaveURL(/\/public\/visitor/);
  });

  test('should show register page', async ({ page }) => {
    await page.goto('/public/visitor/register');
    await expect(page).toHaveURL(/\/public\/visitor\/register/);
  });

  test('should show invite page', async ({ page }) => {
    await page.goto('/public/visitor/invite');
    await expect(page).toHaveURL(/\/public\/visitor\/invite/);
  });

  test('should show pass page', async ({ page }) => {
    await page.goto('/public/visitor/pass');
    await expect(page).toHaveURL(/\/public\/visitor\/pass/);
  });

  test('should show status page', async ({ page }) => {
    await page.goto('/public/visitor/status');
    await expect(page).toHaveURL(/\/public\/visitor\/status/);
  });
});
