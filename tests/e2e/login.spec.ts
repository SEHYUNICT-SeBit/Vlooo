import { test, expect } from '@playwright/test';

test('login with demo credentials', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('이메일').fill('demo@vlooo.ai');
  await page.getByLabel('비밀번호').fill('demo1234');
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('대시보드');
});
