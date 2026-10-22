import { test, expect } from '@playwright/test';
import { guideLessons } from '../../src/data/lessons';
import { protocols } from '../../src/data/protocols';

for (const protocol of protocols) {
  test(`${protocol.lesson}: readable lesson, controls, quiz, and navigation`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/lessons/${protocol.lesson}/`);
    await expect(page.locator('h1')).toHaveText(protocol.name);
    const sim = page.locator('.sim');
    await expect(sim.getByRole('button', { name: 'Play', exact: true })).toBeVisible();
    await expect(sim.locator('[data-speed]')).toHaveValue('6000');
    await expect(sim.locator('[data-playback-status]')).toHaveText('Paused · step 0');
    await sim.getByRole('button', { name: 'Step', exact: true }).click();
    await expect(sim.locator('[data-playback-status]')).toContainText('step 1');
    await expect(sim.locator('[data-caption]')).not.toBeEmpty();
    await sim.getByRole('button', { name: 'Restart', exact: true }).click();
    await expect(sim.locator('[data-playback-status]')).toHaveText('Paused · step 0');
    // Inline text boundaries are verified in the actual generated HTML, including the first three lessons.
    const joined = await page.locator('.prose').evaluate(el => {
      const failures: string[] = [];
      for (const inline of el.querySelectorAll('em, strong, code, a')) {
        const before = inline.previousSibling?.textContent ?? '';
        const after = inline.nextSibling?.textContent ?? '';
        const content = inline.textContent ?? '';
        if (/\p{L}$/u.test(before) && /^\p{L}/u.test(content)) failures.push(`${before.slice(-25)}|${content}`);
        if (/\p{L}$/u.test(content) && /^\p{L}/u.test(after)) failures.push(`${content}|${after.slice(0, 25)}`);
      }
      return failures;
    });
    expect(joined).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const quiz = page.locator('[data-quiz]').first();
    await quiz.locator('[data-correct="false"]').first().click();
    await expect(quiz.locator('[data-feedback]')).toHaveAttribute('data-result', 'wrong');
    await quiz.locator('[data-correct="true"]').click();
    await expect(quiz.locator('[data-feedback]')).toHaveAttribute('data-result', 'right');
    const mark = page.locator('[data-mark]');
    await mark.click();
    await expect(mark).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('[data-mark]')).toHaveAttribute('aria-pressed', 'true');
    for (const link of await page.getByRole('navigation', { name: 'Lesson navigation' }).getByRole('link').all()) {
      const href = await link.getAttribute('href');
      expect((await page.request.get(href!)).ok()).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

for (const lesson of guideLessons) {
  test(`${lesson.slug}: both scenario endings and replay`, async ({ page }) => {
    await page.goto(`/lessons/${lesson.slug}/`);
    const sim = page.locator('.sim');
    for (let scenario = 0; scenario < lesson.walkthrough.scenarios.length; scenario++) {
      await sim.locator('[data-scenario]').selectOption(String(scenario));
      const frames = lesson.walkthrough.scenarios[scenario].frames;
      await expect(sim.locator('[data-frame-title]')).toHaveText(frames[0].title);
      for (let i = 1; i < frames.length; i++) {
        await sim.getByRole('button', { name: 'Step', exact: true }).click();
        await expect(sim.locator('[data-frame-title]')).toHaveText(frames[i].title);
        await expect(sim.locator('[data-changed="true"]').first()).toBeVisible();
      }
      await expect(sim.getByRole('button', { name: 'Step', exact: true })).toBeDisabled();
      await expect(sim.getByRole('button', { name: 'Replay', exact: true })).toBeVisible();
      await expect(sim.locator('[data-history] li')).toHaveCount(frames.length);
      await sim.getByRole('button', { name: 'Replay', exact: true }).click();
      await expect(sim.locator('[data-frame-title]')).toHaveText(frames[0].title);
      await sim.getByRole('button', { name: 'Pause', exact: true }).click();
      await sim.getByRole('button', { name: 'Restart', exact: true }).click();
      await expect(sim.locator('[data-frame-title]')).toHaveText(frames[0].title);
    }
  });
}

test('playback waits the selected interval and pause holds the current step', async ({ page }) => {
  await page.clock.install();
  await page.goto('/lessons/simplex/');
  const sim = page.locator('.sim');
  await sim.scrollIntoViewIfNeeded();
  await page.clock.runFor(100);
  await page.clock.fastForward(12000);
  await expect(sim.locator('[data-playback-status]')).toHaveText('Paused · step 0');
  await sim.getByRole('button', { name: 'Play', exact: true }).click();
  await page.clock.runFor(5900);
  await expect(sim.locator('[data-playback-status]')).toHaveText('Playing · step 0');
  await page.clock.runFor(100);
  await expect(sim.locator('[data-playback-status]')).toHaveText('Playing · step 1');
  await sim.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.clock.fastForward(20000);
  await expect(sim.locator('[data-playback-status]')).toHaveText('Paused · step 1');
  await sim.locator('[data-speed]').selectOption('10000');
  await sim.getByRole('button', { name: 'Play', exact: true }).click();
  await page.clock.runFor(9900);
  await expect(sim.locator('[data-playback-status]')).toHaveText('Playing · step 1');
  await page.clock.runFor(100);
  await expect(sim.locator('[data-playback-status]')).toHaveText('Playing · step 2');
});

test('reduced motion starts paused and leaves the diagrams usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/lessons/tendermint/');
  await page.locator('[data-act="step"]').click();
  await expect(page.locator('[data-playback-status]')).toHaveText('Paused · step 1');
  await expect(page.locator('.tm-packet')).toHaveCount(0);
  await expect(page.locator('[data-caption]')).toContainText(/prevote/i);
});

test('catalog, tree progress, and mistake reporting', async ({ page }) => {
  await page.goto('/lessons/');
  await expect(page.locator('.lessons > li')).toHaveCount(17);
  await page.getByRole('link', { name: 'Paxos', exact: true }).click();
  await page.locator('[data-mark]').click();
  await page.goto('/');
  await expect(page.locator('[data-done]')).toHaveText('1');
  await expect(page.locator('[data-progress]')).toHaveAttribute('data-total', '17');
  await page.goto('/about/');
  await expect(page.getByRole('link', { name: 'create an issue on GitHub' })).toHaveAttribute('href', 'https://github.com/rootulp/consensus-field-guide/issues');
});

for (const slug of ['simplex', 'minimmit']) {
  test(`${slug}: automatic playback stops at completion`, async ({ page }) => {
    await page.clock.install();
    await page.goto(`/lessons/${slug}/`);
    await page.locator('[data-act="play"]').click();
    await page.clock.runFor(180000);
    await expect(page.locator('[data-playback-status]')).toContainText('Complete');
    const caption = await page.locator('[data-caption]').textContent();
    await page.clock.fastForward(30000);
    await expect(page.locator('[data-caption]')).toHaveText(caption!);
    await expect(page.getByRole('button', { name: 'Replay', exact: true })).toBeVisible();
  });
}

test('scrolling away pauses playback; narrow viewports contain the diagrams', async ({ page }) => {
  await page.clock.install();
  await page.setViewportSize({ width: 320, height: 740 });
  for (const slug of ['tendermint', 'simplex', 'minimmit']) {
    await page.goto(`/lessons/${slug}/`);
    await page.locator('[data-act="play"]').click();
    await page.locator('.papers').scrollIntoViewIfNeeded();
    await page.clock.runFor(100);
    await expect(page.locator('[data-playback-status]')).toContainText('Paused');
    const status = await page.locator('[data-playback-status]').textContent();
    await page.clock.fastForward(15000);
    await expect(page.locator('[data-playback-status]')).toHaveText(status!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    if (slug === 'tendermint') {
      expect(await page.locator('.tm-stage-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    } else {
      expect(await page.locator('.sim-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
  }
});

test('glossary is reachable from lessons and supports direct term links', async ({ page }) => {
  await page.goto('/lessons/simplex/');
  await page.getByRole('link', { name: 'Keep the glossary handy →' }).click();
  await expect(page).toHaveURL(/\/glossary\/$/);
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Glossary' })).toHaveAttribute('aria-current', 'page');
  const index = page.getByRole('navigation', { name: 'Glossary terms' });
  await index.getByRole('link', { name: 'Certificate (QC)', exact: true }).click();
  await expect(page).toHaveURL(/#certificate$/);
  await expect(page.locator('#certificate')).toBeInViewport();
  await expect(page.locator('#certificate')).toContainText('Verifiable evidence');
  await page.locator('#certificate').getByRole('link', { name: 'See it in HotStuff →' }).click();
  await expect(page).toHaveURL(/\/lessons\/hotstuff\/$/);
  await page.goto('/glossary/#notarize');
  await expect(page.locator('#notarize')).toBeInViewport();
  await expect(page.locator('#notarize')).toContainText('Notarized does not universally mean final');
  await page.goto('/glossary/#view');
  await expect(page.locator('#view')).toBeInViewport();
  await expect(page.locator('#view')).toContainText('numbered leadership period');
  // The index and further-reading links must point to real sections and routes.
  const brokenAnchors = await index.locator('a').evaluateAll(links => links.filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash));
  expect(brokenAnchors).toEqual([]);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});
