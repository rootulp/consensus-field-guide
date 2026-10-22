import { describe, expect, it } from 'vitest';
import { guideLessons } from '../src/data/lessons';
import { protocols } from '../src/data/protocols';
import { advanceWalkthrough, changedCards, currentFrame, initialWalkthrough, walkthroughDone } from '../src/lib/sims/walkthrough';

describe('curriculum coverage and walkthrough navigation', () => {
  it('has exactly one lesson route for every family-tree topic', () => {
    expect(protocols).toHaveLength(17);
    expect(protocols.every(p => p.lesson && p.minutes)).toBe(true);
    expect(new Set(protocols.map(p => p.lesson)).size).toBe(protocols.length);
    for (const lesson of guideLessons) {
      expect(protocols.find(p => p.id === lesson.id)?.lesson).toBe(lesson.slug);
      expect(lesson.papers.length).toBeGreaterThan(0);
      for (const section of lesson.sections) {
        if (section.source !== undefined) expect(lesson.papers[section.source]).toBeDefined();
      }
    }
  });

  for (const lesson of guideLessons) {
    it(`${lesson.slug}: both scenarios reach a stable ending without crossing scenarios`, () => {
      const scenarios = lesson.walkthrough.scenarios;
      expect(scenarios).toHaveLength(2);
      for (let scenario = 0; scenario < scenarios.length; scenario++) {
        let state = initialWalkthrough(scenario);
        const seen = [currentFrame(scenarios, state).title];
        for (let i = 1; i < scenarios[scenario].frames.length; i++) {
          const before = state;
          const previous = currentFrame(scenarios, before);
          state = advanceWalkthrough(scenarios, state);
          expect(before.frame).toBe(i - 1);
          expect(state.scenario).toBe(scenario);
          const current = currentFrame(scenarios, state);
          expect(current.cards.map(c => c.label)).toEqual(previous.cards.map(c => c.label));
          expect(changedCards(previous, current).some(Boolean)).toBe(true);
          seen.push(current.title);
        }
        expect(new Set(seen).size).toBe(seen.length);
        expect(walkthroughDone(scenarios, state)).toBe(true);
        expect(advanceWalkthrough(scenarios, state)).toBe(state);
      }
    });
  }
});
