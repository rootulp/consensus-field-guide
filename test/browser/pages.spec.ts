import { test, expect } from '@playwright/test';

const base = '/consensus-field-guide/';

test('GitHub Pages paths, assets, and interactive lessons work under the repository prefix', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}?p=tm`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-field="cta"]')).toHaveAttribute('href', `${base}lessons/tendermint/`);
  await page.locator('[data-field="cta"]').click();
  await expect(page).toHaveURL(new RegExp(`${base}lessons/tendermint/$`));
  await page.locator('[data-act="step"]').click();
  await expect(page.locator('[data-playback-status]')).toContainText('step 1');
  await page.locator('[data-quiz]').first().locator('[data-correct="true"]').click();
  await expect(page.locator('[data-feedback]').first()).toHaveAttribute('data-result', 'right');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Lessons' }).click();
  const lessons = await page.locator('.lessons h2 a').evaluateAll(links => links.map(a => a.getAttribute('href')!));
  expect(lessons).toHaveLength(17);
  for (const path of [...lessons, `${base}about/`, `${base}glossary/`]) {
    expect(path.startsWith(base)).toBe(true);
    await page.goto(path);
    const resources = await page.locator('a[href^="/"],link[rel="stylesheet"][href^="/"],link[rel="icon"],script[src]').evaluateAll(elements => elements.map(el => el.getAttribute('href') ?? el.getAttribute('src')!));
    for (const resource of new Set(resources)) {
      expect(resource.startsWith(base), resource).toBe(true);
      const response = await page.request.get(resource);
      expect(response.ok(), `${path} links to ${resource}`).toBe(true);
    }
  }
  await page.goto(`${base}glossary/#view`);
  await expect(page.locator('#view')).toBeInViewport();
  await page.locator('#view').getByRole('link', { name: 'See it in Simplex →' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}lessons/simplex/$`));
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('missing project URLs return the custom 404 with working home links', async ({ page }) => {
  const response = await page.goto(`${base}does-not-exist/`);
  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('This path isn’t on the map.');
  await page.getByRole('link', { name: 'Explore the family tree →' }).click();
  await expect(page).toHaveURL(new RegExp(`${base}$`));
  await expect(page.locator('h1')).toHaveText('Every protocol has parents.');
});
