// The family tree: every protocol, which family it belongs to, and who built on whom.
// Positions (x, y) place each node on the 1000 x 980 tree canvas; y roughly tracks time.

export type FamilyId = 'crash' | 'classic' | 'chain' | 'nak' | 'sample';

export interface Family {
  id: FamilyId;
  label: string;
  color: string;
  /** Center x of the family's column label on the tree canvas. */
  column: number;
}

export const families: Record<FamilyId, Family> = {
  crash: { id: 'crash', label: 'Crash-fault', color: '#0F766E', column: 110 },
  classic: { id: 'classic', label: 'Classical BFT', color: '#6D28D9', column: 300 },
  chain: { id: 'chain', label: 'Blockchain BFT', color: '#2747D6', column: 540 },
  nak: { id: 'nak', label: 'Nakamoto & PoS', color: '#B4530A', column: 760 },
  sample: { id: 'sample', label: 'Sampling', color: '#BE185D', column: 920 },
};

export type Tag = 'crash' | 'final' | 'prob';

export interface Protocol {
  id: string;
  name: string;
  year: number;
  /** Shown instead of `year` when the date needs nuance, e.g. "1989 / 1998". */
  yearLabel?: string;
  family: FamilyId;
  who: string;
  /** One or two sentences: the idea this protocol gave the field. */
  gift: string;
  tags: Tag[];
  x: number;
  y: number;
  /** Set when a full lesson exists at /lessons/<lesson>/. */
  lesson?: string;
  minutes?: number;
}

export const protocols: Protocol[] = [
  {
    id: 'bg', name: 'Byzantine Generals', year: 1982, family: 'classic', who: 'Lamport, Shostak & Pease',
    gift: 'Defined the problem every later protocol solves: agree even when some participants lie. Showed you need more than 3f participants to tolerate f liars.',
    tags: [], x: 300, y: 70,
  },
  {
    id: 'dls', name: 'Partial synchrony', year: 1988, family: 'classic', who: 'Dwork, Lynch & Stockmeyer',
    gift: 'A network model where messages are eventually delivered on time. Protocols stay safe always and make progress once the network settles. Nearly every modern BFT protocol assumes it.',
    tags: [], x: 300, y: 160,
  },
  {
    id: 'px', name: 'Paxos', year: 1989, yearLabel: '1989 / 1998', family: 'crash', who: 'Leslie Lamport',
    gift: 'Agreement among machines that may crash but never lie, using majority quorums that always overlap. Written in 1989, published in 1998, and still running inside large databases.',
    tags: ['crash', 'final'], x: 110, y: 170,
  },
  {
    id: 'pbft', name: 'PBFT', year: 1999, family: 'classic', who: 'Castro & Liskov',
    gift: 'Made Byzantine agreement fast enough for real systems: three phases of voting among 3f+1 replicas, and a view-change protocol to replace a bad leader.',
    tags: ['final'], x: 300, y: 270,
  },
  {
    id: 'btc', name: 'Bitcoin', year: 2008, family: 'nak', who: 'Satoshi Nakamoto',
    gift: 'Let anyone join without permission by replacing votes with proof-of-work. The heaviest chain wins, so finality is probabilistic.',
    tags: ['prob'], x: 760, y: 360,
  },
  {
    id: 'ppc', name: 'Peercoin', year: 2012, family: 'nak', who: 'King & Nadal',
    gift: 'The first chain to use stake, not just work, to decide who makes blocks.',
    tags: ['prob'], x: 760, y: 440,
  },
  {
    id: 'raft', name: 'Raft', year: 2014, family: 'crash', who: 'Ongaro & Ousterhout',
    gift: 'Paxos redesigned to be understandable, built around a strong leader and a replicated log. It runs etcd, and through it Kubernetes.',
    tags: ['crash', 'final'], x: 110, y: 510,
  },
  {
    id: 'tm', name: 'Tendermint', year: 2014, family: 'chain', who: 'Jae Kwon; Buchman, Kwon & Milosevic',
    gift: 'Brought PBFT-style voting to a stake-weighted, open validator set with rotating proposers. Blocks are final the moment they commit. Lives on as CometBFT.',
    tags: ['final'], x: 540, y: 510, lesson: 'tendermint', minutes: 15,
  },
  {
    id: 'eth', name: 'Ethereum', year: 2015, family: 'nak', who: 'Buterin et al.',
    gift: 'A programmable blockchain. It launched on proof-of-work and later moved to proof-of-stake.',
    tags: ['prob'], x: 760, y: 520,
  },
  {
    id: 'hs', name: 'HotStuff', year: 2018, family: 'chain', who: 'Yin, Malkhi, Reiter, Golan Gueta & Abraham',
    gift: 'The leader collects votes and forwards a certificate, so messages grow linearly with the validator set. A new leader no longer has to wait out the worst-case network delay, and phases pipeline across blocks.',
    tags: ['final'], x: 540, y: 600,
  },
  {
    id: 'ava', name: 'Avalanche', year: 2018, family: 'sample', who: 'Team Rocket',
    gift: 'Validators repeatedly poll small random samples of peers until the whole network tips toward one answer.',
    tags: ['prob'], x: 920, y: 600,
  },
  {
    id: 'nb', name: 'Narwhal & Bullshark', year: 2021, family: 'classic', who: 'Danezis, Kokoris-Kogias, Sonnino, Spiegelman et al.',
    gift: 'Separates spreading transactions (a DAG of certified batches) from ordering them, so ordering needs almost no extra messages.',
    tags: ['final'], x: 320, y: 690,
  },
  {
    id: 'gas', name: 'Gasper (The Merge)', year: 2022, family: 'nak', who: 'Buterin et al.',
    gift: 'Pairs a fork-choice rule (LMD-GHOST) with a finality gadget (Casper FFG): blocks keep coming, and checkpoints become final once two-thirds of stake attest.',
    tags: ['final'], x: 760, y: 690,
  },
  {
    id: 'spx', name: 'Simplex', year: 2023, family: 'chain', who: 'Benjamin Y. Chan & Rafael Pass',
    gift: 'One code path for good and bad leaders: notarize or nullify, then finalize. Optimal latency with a proof short enough to teach in one lecture. Commonware’s consensus library is built on it.',
    tags: ['final'], x: 540, y: 700, lesson: 'simplex', minutes: 15,
  },
  {
    id: 'mm', name: 'Minimmit', year: 2025, family: 'chain', who: 'Chou, Lewis-Pye & O’Grady (Commonware)',
    gift: 'Moves to the next view at a 2f+1 quorum and finalizes at n−f after a single round of voting. In exchange it tolerates fewer than 20% faulty replicas instead of a third.',
    tags: ['final'], x: 450, y: 800, lesson: 'minimmit', minutes: 15,
  },
  {
    id: 'raptr', name: 'Raptr', year: 2025, family: 'chain', who: 'Aptos Labs',
    gift: 'Orders blocks from many producers at once and finalizes the longest prefix of the leader’s proposal that a quorum actually holds.',
    tags: ['final'], x: 640, y: 800,
  },
  {
    id: 'mmx', name: 'Multimmit', year: 2026, family: 'chain', who: 'Lewis-Pye & O’Grady (Commonware)',
    gift: 'Minimmit’s one-round voting with many block producers in parallel. Votes say how far each producer’s chain can be included, so a faulty producer only delays its own chain. Still a draft paper.',
    tags: ['final'], x: 545, y: 900,
  },
];

/** [parent, child]: the child built directly on the parent's ideas. */
export const edges: [string, string][] = [
  ['bg', 'dls'], ['bg', 'pbft'], ['dls', 'pbft'], ['px', 'pbft'], ['px', 'raft'],
  ['pbft', 'tm'], ['ppc', 'tm'], ['btc', 'ppc'], ['btc', 'eth'], ['btc', 'ava'],
  ['tm', 'hs'], ['pbft', 'hs'], ['hs', 'nb'], ['tm', 'gas'], ['eth', 'gas'],
  ['tm', 'spx'], ['hs', 'spx'], ['spx', 'mm'],
  ['hs', 'raptr'], ['nb', 'raptr'], ['mm', 'mmx'], ['raptr', 'mmx'],
];

export const byId: Record<string, Protocol> = Object.fromEntries(protocols.map((p) => [p.id, p]));

export const parentsOf = (id: string): Protocol[] => edges.filter(([, c]) => c === id).map(([p]) => byId[p]);
export const childrenOf = (id: string): Protocol[] => edges.filter(([p]) => p === id).map(([, c]) => byId[c]);

export const lessons: Protocol[] = protocols.filter((p) => p.lesson);

export const lessonHref = (p: Protocol): string | undefined => (p.lesson ? `/lessons/${p.lesson}/` : undefined);

export const displayYear = (p: Protocol): string => p.yearLabel ?? String(p.year);
