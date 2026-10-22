// A teaching model of one Tendermint height: propose -> prevote -> precommit -> commit.
// Four validators with equal stake; up to two can be taken offline.

export const N = 4;
export const PHASES = ['Propose', 'Prevote', 'Precommit', 'Commit'] as const;

/** Validators that go offline first, in order (V4, then V3). */
export const OFFLINE_ORDER = [3, 2];

export interface TendermintState {
  height: number;
  round: number;
  /** Index into PHASES. */
  phase: number;
  /** The proposer was offline; validators are timing out this round. */
  timeout: boolean;
  /** Fewer than 2/3 are online, so no vote can reach quorum. */
  stalled: boolean;
  offlineCount: number;
  chain: number[];
}

export const initialState = (): TendermintState => ({
  height: 6,
  round: 0,
  phase: 0,
  timeout: false,
  stalled: false,
  offlineCount: 0,
  chain: [2, 3, 4, 5],
});

export const proposer = (s: TendermintState): number => (s.height + s.round) % N;

export const isOffline = (s: TendermintState, v: number): boolean => OFFLINE_ORDER.slice(0, s.offlineCount).includes(v);

export const onlineCount = (s: TendermintState): number => N - s.offlineCount;

/** More than 2/3 of voting power must take part for any vote to count. */
export const hasQuorum = (s: TendermintState): boolean => onlineCount(s) * 3 > N * 2;

export function step(s: TendermintState): TendermintState {
  if (s.timeout) {
    if (!hasQuorum(s)) return { ...s, stalled: true };
    return { ...s, timeout: false, stalled: false, round: s.round + 1, phase: 0 };
  }
  if (s.phase === 0) {
    if (isOffline(s, proposer(s))) return { ...s, timeout: true };
    return { ...s, phase: 1 };
  }
  if (s.phase === 1 || s.phase === 2) {
    if (!hasQuorum(s)) return { ...s, stalled: true };
    return { ...s, phase: s.phase + 1, stalled: false };
  }
  return {
    ...s,
    chain: [...s.chain, s.height].slice(-6),
    height: s.height + 1,
    round: 0,
    phase: 0,
    stalled: false,
  };
}

export function setOffline(s: TendermintState, offlineCount: number): TendermintState {
  return { ...s, offlineCount, stalled: false };
}

export function describe(s: TendermintState): string {
  const p = `V${proposer(s) + 1}`;
  if (s.stalled) {
    return `Only ${onlineCount(s)} of ${N} validators are online, which is not more than 2/3. No vote can reach quorum, so the chain halts. Tendermint stops rather than risk a fork, and resumes the moment enough validators return.`;
  }
  if (s.timeout) {
    return `${p} is offline and it is its turn to propose. Everyone times out, prevotes nil, and moves to round ${s.round + 1} with a new proposer. Safety is never at risk; only time is lost.`;
  }
  switch (s.phase) {
    case 0:
      return `Propose: ${p} broadcasts a block for height ${s.height}. The proposer rotates every height and round.`;
    case 1:
      return 'Prevote: each validator gossips a vote for the block it received. Nothing is final yet.';
    case 2:
      return 'Precommit: on seeing more than 2/3 prevotes for the block, a validator locks on it and precommits.';
    default:
      return `Commit: more than 2/3 precommits. Block #${s.height} is final right now. No later block can ever replace it.`;
  }
}
