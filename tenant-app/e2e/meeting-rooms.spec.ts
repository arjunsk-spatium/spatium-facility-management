import { test, expect } from '@playwright/test';

test.describe('Meeting Rooms Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should list meeting rooms', async ({ page }) => {
    await page.goto('/meeting-rooms');
    await expect(page.getByRole('heading', { name: 'Meeting Rooms' })).toBeVisible();
  });

  test('should show bookings', async ({ page }) => {
    await page.goto('/meeting-rooms/bookings');
    await expect(page).toHaveURL(/\/meeting-rooms\/bookings/);
  });

  test('should show insights', async ({ page }) => {
    await page.goto('/meeting-rooms/insights');
    await expect(page).toHaveURL(/\/meeting-rooms\/insights/);
  });
});
