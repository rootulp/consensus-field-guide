// A teaching model of Simplex over a run of views. In each view the leader proposes,
// validators notarize (or nullify on timeout), and a notarized block is finalized one
// step later while the next view is already running.

export type SimplexStatus = 'pending' | 'proposed' | 'waiting' | 'notarized' | 'finalized' | 'nullified';

export const VIEWS = 7;
export const LEADERS = ['P3', 'P1', 'P4', 'P2', 'P1', 'P3', 'P2'];
/** The view (0-indexed) whose leader can be taken offline. */
export const FAULTY_VIEW = 3;

export interface SimplexState {
  st: SimplexStatus[];
  cur: number;
  /** 0: the current view's proposal is pending; 1: votes are being collected. */
  stage: number;
  leaderOffline: boolean;
  last: string;
}

export const initialState = (leaderOffline = true): SimplexState => ({
  st: Array<SimplexStatus>(VIEWS).fill('pending'),
  cur: 0,
  stage: 0,
  leaderOffline,
  last: '',
});

export const isDone = (s: SimplexState): boolean =>
  s.cur >= VIEWS && s.st.every((x) => x === 'finalized' || x === 'nullified');

export function step(s: SimplexState): SimplexState {
  if (isDone(s)) return initialState(s.leaderOffline);
  const st = s.st.map((x) => (x === 'notarized' ? 'finalized' : x));
  const finalizedNow = s.st.findIndex((x) => x === 'notarized');
  let { cur, stage } = s;
  let last = '';
  if (cur < VIEWS) {
    const bad = s.leaderOffline && cur === FAULTY_VIEW;
    const v = cur + 1;
    if (stage === 0) {
      st[cur] = bad ? 'waiting' : 'proposed';
      last = bad
        ? `View ${v}: the leader is offline. Validators wait for their timeout.`
        : `View ${v}: leader ${LEADERS[cur]} proposes a block.`;
      stage = 1;
    } else {
      st[cur] = bad ? 'nullified' : 'notarized';
      last = bad
        ? `Timeout. 2/3 vote to nullify view ${v}, and everyone moves to view ${v + 1}. Same path as normal, no special view-change protocol.`
        : `2/3 voted, so view ${v} is notarized.${v < VIEWS ? ` View ${v + 1} starts now.` : ''}`;
      cur += 1;
      stage = 0;
    }
  }
  if (finalizedNow >= 0) {
    last = `View ${finalizedNow + 1} finalized while the next view was already running. ${last}`.trim();
  }
  return { ...s, st, cur, stage, last: last || 'All views are done.' };
}
