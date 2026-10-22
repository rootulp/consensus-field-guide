import { describe, expect, it } from 'vitest';
import * as tm from '../src/lib/sims/tendermint';
import * as spx from '../src/lib/sims/simplex';
import * as mm from '../src/lib/sims/minimmit';

const run = <S>(s: S, step: (s: S) => S, n: number): S => {
  for (let i = 0; i < n; i++) s = step(s);
  return s;
};

describe('tendermint', () => {
  it('commits one block every four steps when everyone is online', () => {
    const s = run(tm.initialState(), tm.step, 4);
    expect(s.height).toBe(7);
    expect(s.chain.at(-1)).toBe(6);
    expect(s.phase).toBe(0);
  });

  it('rotates the proposer each height', () => {
    const s = tm.initialState();
    expect(tm.proposer(s)).not.toBe(tm.proposer(tm.step(tm.step(tm.step(tm.step(s))))));
  });

  it('times out and moves to the next round when the proposer is offline', () => {
    // Height 7 round 0 has proposer V4, the first validator to go offline.
    let s = tm.setOffline(run(tm.initialState(), tm.step, 4), 1);
    expect(tm.proposer(s)).toBe(3);
    s = tm.step(s);
    expect(s.timeout).toBe(true);
    s = tm.step(s);
    expect(s.round).toBe(1);
    expect(tm.isOffline(s, tm.proposer(s))).toBe(false);
    s = run(s, tm.step, 4);
    expect(s.chain.at(-1)).toBe(7);
  });

  it('halts instead of committing when only half the validators are online', () => {
    let s = tm.setOffline(tm.initialState(), 2);
    s = run(s, tm.step, 10);
    expect(s.stalled).toBe(true);
    expect(s.chain.at(-1)).toBe(5);
    expect(tm.describe(s)).toMatch(/halts/);
  });
});

describe('simplex', () => {
  it('finalizes each notarized view one step later', () => {
    let s = spx.step(spx.step(spx.initialState(false)));
    expect(s.st[0]).toBe('notarized');
    s = spx.step(s);
    expect(s.st[0]).toBe('finalized');
    expect(s.st[1]).toBe('proposed');
  });

  it('nullifies the faulty view and never finalizes it', () => {
    let s = spx.initialState(true);
    while (!spx.isDone(s)) s = spx.step(s);
    expect(s.st[spx.FAULTY_VIEW]).toBe('nullified');
    expect(s.st.filter((x) => x === 'finalized')).toHaveLength(spx.VIEWS - 1);
  });

  it('restarts after every view settles', () => {
    let s = spx.initialState(false);
    while (!spx.isDone(s)) s = spx.step(s);
    expect(spx.step(s).cur).toBe(0);
  });
});

describe('minimmit', () => {
  it('uses the quorums from the spec', () => {
    expect(mm.N).toBeGreaterThanOrEqual(5 * mm.F + 1);
    expect(mm.M).toBe(3);
    expect(mm.L).toBe(5);
  });

  it('starts the next view at 2f+1 votes and finalizes at n-f votes', () => {
    let s = mm.step(mm.initialState(0)); // view 1 proposed (1 vote)
    s = mm.step(s); // 3 votes: notarized, view 2 proposed
    expect(s.views[0].status).toBe('notarized');
    expect(s.views[1].status).toBe('proposed');
    s = mm.step(s); // 5 votes: final
    expect(s.views[0].status).toBe('final');
  });

  it('still finalizes with f replicas offline, and nullifies the silent leader', () => {
    let s = mm.initialState(1);
    while (!mm.isDone(s)) s = mm.step(s);
    const silent = mm.LEADERS.indexOf(mm.OFFLINE_ORDER[0]);
    expect(s.views[silent].status).toBe('nullified');
    expect(s.views.filter((v) => v.status === 'final')).toHaveLength(mm.VIEWS - 1);
  });

  it('keeps notarizing but never finalizes with more than f offline', () => {
    let s = mm.initialState(2);
    for (let i = 0; i < 200 && !mm.isDone(s); i++) s = mm.step(s);
    expect(mm.isDone(s)).toBe(true);
    expect(s.views.some((v) => v.status === 'final')).toBe(false);
    expect(s.views.filter((v) => v.status === 'notarized').length).toBeGreaterThan(0);
  });
});
