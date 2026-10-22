export interface Paper { title: string; authors: string; year: string; href: string; note?: string }
export type Tone = 'neutral' | 'active' | 'good' | 'warn';
export interface Card { label: string; value: string; tone: Tone }
export interface Frame { title: string; explanation: string; cards: Card[] }
export interface Scenario { name: string; frames: Frame[] }
export interface GuideLesson {
  id: string;
  slug: string;
  minutes: number;
  dek: string;
  before: string[];
  takeaway: string;
  sections: { title: string; paragraphs: string[]; source?: number }[];
  tradeoffs: string[];
  papers: Paper[];
  quizzes: { question: string; options: { text: string; correct?: boolean }[]; right: string; wrong: string }[];
  walkthrough: { title: string; model: string; scenarios: Scenario[] };
}

/** Authoring helpers keep the narrative beside the exact diagram state it describes. */
export const card = (label: string, value: string, tone: Tone = 'neutral'): Card => ({ label, value, tone });
export const frame = (title: string, explanation: string, ...cards: Card[]): Frame => ({ title, explanation, cards });
export const section = (title: string, paragraphs: string[], source?: number) => ({ title, paragraphs, source });
export const quiz = (question: string, correct: string, other: string, explanation: string) => ({
  question, options: [{ text: other }, { text: correct, correct: true }],
  right: `Yes. ${explanation}`, wrong: `Try again. ${explanation}`,
});
