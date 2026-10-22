import type { Frame, Scenario } from '../../data/lessons/types';

export interface WalkthroughState { scenario: number; frame: number }
export const initialWalkthrough = (scenario = 0): WalkthroughState => ({ scenario, frame: 0 });
export const currentFrame = (scenarios: Scenario[], state: WalkthroughState): Frame => scenarios[state.scenario].frames[state.frame];
export const walkthroughDone = (scenarios: Scenario[], state: WalkthroughState): boolean => state.frame === scenarios[state.scenario].frames.length - 1;
export function advanceWalkthrough(scenarios: Scenario[], state: WalkthroughState): WalkthroughState {
  return walkthroughDone(scenarios, state) ? state : { ...state, frame: state.frame + 1 };
}
export function changedCards(previous: Frame | undefined, current: Frame): boolean[] {
  return current.cards.map((card, index) => {
    const before = previous?.cards[index];
    return !!before && (card.value !== before.value || card.tone !== before.tone || card.label !== before.label);
  });
}
