import { test, expect } from '@playwright/test';

test.describe('Helpdesk Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should list tickets', async ({ page }) => {
    await page.goto('/helpdesk');
    await expect(page.getByRole('heading', { name: 'Helpdesk' })).toBeVisible();
  });

  test('should show insights', async ({ page }) => {
    await page.goto('/helpdesk/insights');
    await expect(page).toHaveURL(/\/helpdesk\/insights/);
  });
});
