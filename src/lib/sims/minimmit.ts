// A teaching model of Minimmit with n = 6 replicas and f = 1 (n >= 5f + 1).
// A view advances once M = 2f + 1 = 3 notarize votes arrive, and a block is final once
// L = n - f = 5 notarize votes arrive: one round of voting, two thresholds.

export const N = 6;
export const F = 1;
export const M = 2 * F + 1;
export const L = N - F;
export const VIEWS = 8;
/** Leader of each view, as replica indexes (R1 = 0). */
export const LEADERS = [1, 4, 0, 5, 2, 3, 1, 4];
/** Replicas that go offline first, in order (R6, then R5). */
export const OFFLINE_ORDER = [5, 4];
/** Votes that arrive per in-flight view per tick. */
const VOTES_PER_TICK = 2;
/** Ticks a replica waits for a silent leader before voting to nullify (the 2Δ timer). */
const TIMEOUT_TICKS = 2;

export type MinimmitStatus = 'pending' | 'proposed' | 'waiting' | 'notarized' | 'final' | 'nullified';

export interface View {
  status: MinimmitStatus;
  votes: number;
  wait: number;
  stuckNoted: boolean;
}

export interface MinimmitState {
  views: View[];
  cur: number;
  offlineCount: number;
  events: string[];
}

const emptyView = (): View => ({ status: 'pending', votes: 0, wait: 0, stuckNoted: false });

export const initialState = (offlineCount = 0): MinimmitState => ({
  views: Array.from({ length: VIEWS }, emptyView),
  cur: 0,
  offlineCount,
  events: [],
});

export const isOffline = (s: MinimmitState, r: number): boolean => OFFLINE_ORDER.slice(0, s.offlineCount).includes(r);
export const onlineCount = (s: MinimmitState): number => N - s.offlineCount;
export const leaderName = (view: number): string => `R${LEADERS[view] + 1}`;

const inFlight = (v: View) => v.status === 'proposed' || v.status === 'notarized';

export const isDone = (s: MinimmitState): boolean =>
  s.cur >= VIEWS && s.views.every((v) => v.status === 'final' || v.status === 'nullified' || (v.status === 'notarized' && v.stuckNoted));

export function step(s: MinimmitState): MinimmitState {
  if (isDone(s)) return initialState(s.offlineCount);
  const online = onlineCount(s);
  const views = s.views.map((v) => ({ ...v }));
  const events: string[] = [];
  let cur = s.cur;
  let advance = false;

  // 1. Votes keep arriving on every view still collecting them.
  views.forEach((v, i) => {
    if (!inFlight(v)) return;
    const before = v.votes;
    v.votes = Math.min(online, v.votes + VOTES_PER_TICK);
    if (v.status === 'proposed' && v.votes >= M) {
      v.status = 'notarized';
      events.push(`View ${i + 1} has ${v.votes} votes, enough for a notarization (2f+1 = ${M}).${i + 1 < VIEWS ? ` View ${i + 2} starts now.` : ''}`);
      if (i === cur) advance = true;
    }
    if (v.votes >= L) {
      v.status = 'final';
      events.push(`View ${i + 1} is final: ${v.votes} of ${N} voted (n−f = ${L}) in a single round.`);
    } else if (v.status === 'notarized' && v.votes === before && !v.stuckNoted) {
      v.stuckNoted = true;
      events.push(`View ${i + 1} is stuck at ${v.votes} votes: with ${s.offlineCount} replicas offline (more than f = ${F}), ${L} votes can never arrive, so it cannot finalize. The chain keeps growing on notarizations.`);
    }
  });
  if (advance) cur += 1;

  // 2. The current view: propose, or time out on a silent leader and nullify.
  if (cur < VIEWS) {
    const c = views[cur];
    const leader = LEADERS[cur];
    if (c.status === 'pending') {
      if (isOffline(s, leader)) {
        c.status = 'waiting';
        events.push(`View ${cur + 1}: leader ${leaderName(cur)} is offline. Replicas start their 2Δ timers.`);
      } else {
        c.status = 'proposed';
        c.votes = 1; // the leader's proposal counts as its own notarize vote
        events.push(`View ${cur + 1}: leader ${leaderName(cur)} proposes a block.`);
      }
    } else if (c.status === 'waiting') {
      c.wait += 1;
      if (c.wait >= TIMEOUT_TICKS) {
        c.status = 'nullified';
        events.push(`Timers expire. ${online} replicas vote nullify(${cur + 1}), more than the ${M} needed, so everyone moves to view ${cur + 2}.`);
        cur += 1;
      }
    }
  }

  return { ...s, views, cur, events: events.length ? events : ['All views are settled.'] };
}

export function setOffline(offlineCount: number): MinimmitState {
  return initialState(offlineCount);
}
