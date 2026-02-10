import { test, expect } from '@playwright/test';

test('home page renders hero', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  const heading = page.getByRole('heading', { level: 1 });
  await heading.waitFor({ state: 'visible' });
  await expect(heading).toHaveText('내 PPT가 전문가의 영상으로 흐르다');
  
  const button = page.getByRole('button', { name: '지금 시작하기' });
  await button.waitFor({ state: 'visible' });
  await expect(button).toBeVisible();
});
