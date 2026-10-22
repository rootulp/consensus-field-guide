import { card as c, frame as f, section as s, quiz as q, type GuideLesson } from './types';

export const blockchains: GuideLesson[] = [
  {
    id: 'btc', slug: 'bitcoin', minutes: 11,
    dek: 'Proof-of-work makes influence costly, while cumulative work lets nodes choose between competing valid histories.',
    before: [], takeaway: 'More confirmations reduce reversal risk under the security assumptions; they never create a deterministic finality certificate.',
    sections: [
      s('Who gets a vote?', [
        'A permissionless network cannot count identities as if each one were an independent participant. An attacker can create many identities. Bitcoin instead makes block production depend on proof-of-work: finding a header hash below a target. Nodes can cheaply verify the result even though finding it costs repeated attempts.',
        'Each node independently checks transactions and blocks. Work does not excuse an invalid signature or a double spend within the chosen history. Fork choice compares valid chains by cumulative work, not by how many peers advertise them.',
      ], 0),
      s('Temporary forks are expected', [
        'Two miners can find valid blocks on the same parent before hearing about each other. Different nodes may temporarily extend different tips. Later work breaks the tie, and nodes reorganize to the valid branch with more cumulative work.',
        'In the walkthrough all blocks have equal difficulty, so counting blocks also counts work. That is a teaching convenience. Across difficulty changes, raw length is not the general fork-choice rule.',
      ], 0),
      s('A confirmation is accumulated evidence', [
        'A transaction in block A has one confirmation when A is accepted as the current tip. Descendants increase its confirmation count. Reversing it requires a competing valid branch to overtake the branch containing A.',
        'The security argument depends on assumptions about adversarial hash power and communication. There is no universal number of confirmations that makes every payment risk-free. A merchant’s waiting policy depends on the consequences of reversal as well as the threat model.',
      ], 0),
      s('Try the reorganization', [
        'Watch A1 and B1 compete on the same parent. A2 first gives A’s branch the lead. In the alternate scenario, B2 and B3 later make B heavier. The node switches, so a payment included only in A1 is no longer confirmed in the selected chain.',
        'A displaced transaction might return to a mempool if still valid; it cannot do so if the winning history spends the same input differently. The animation leaves transaction selection out so you can focus on the difference between “currently selected” and “irreversible.”',
      ]),
    ],
    tradeoffs: ['Proof-of-work consumes resources and gives probabilistic settlement rather than immediate finality.', 'Network propagation, mining concentration, and adversarial work affect the security of the confirmation policy.'],
    papers: [{ title: 'Bitcoin: A Peer-to-Peer Electronic Cash System', authors: 'Satoshi Nakamoto', year: '2008', href: 'https://bitcoin.org/bitcoin.pdf', note: 'Sections 4–6 and 11: work, forks, and reversal probability' }],
    quizzes: [q('Which chain should a node choose?', 'The valid chain with the most cumulative proof-of-work.', 'The chain advertised by the most peer identities.', 'Permissionless identities are cheap; accumulated work is the fork-choice resource.'), q('Do six confirmations prove a transaction cannot be reversed?', 'No; they reduce risk under assumptions.', 'Yes; the sixth block is a finality certificate.', 'Bitcoin confirmations are probabilistic evidence, not a BFT commit certificate.')],
    walkthrough: {
      title: 'Watch competing branches gain work', model: 'Equal-difficulty blocks and a fixed common parent G. This is a chosen fork trace, not a hash-power probability or mining-time simulator.',
      scenarios: [
        { name: 'Fork resolves normally', frames: [
          f('Common parent', 'Both miners start from G. Neither branch has added work yet.', c('Branch A', 'G'), c('Branch B', 'G'), c('Selected tip', 'G')),
          f('Two blocks race', 'A1 and B1 each add one unit of work. Nodes may temporarily disagree on their preferred tip.', c('Branch A', 'G → A1 · work 1', 'active'), c('Branch B', 'G → B1 · work 1', 'active'), c('Selected tip', 'Tie: local choices differ', 'warn')),
          f('A gains a descendant', 'A2 adds work. A’s branch now exceeds B’s, so nodes that receive both prefer A2.', c('Branch A', 'G → A1 → A2 · work 2', 'good'), c('Branch B', 'G → B1 · work 1'), c('Selected tip', 'A2; A1 has 2 confirmations', 'good')),
        ] },
        { name: 'A later reorganization', frames: [
          f('A is currently ahead', 'A1 contains a payment. With A2 above it, that payment currently has two confirmations.', c('Branch A', 'G → A1 → A2 · work 2', 'good'), c('Branch B', 'G → B1 · work 1'), c('Payment in A1', '2 confirmations', 'good')),
          f('B catches up', 'B2 makes equal work. A node already following A need not switch on this tie.', c('Branch A', 'G → A1 → A2 · work 2'), c('Branch B', 'G → B1 → B2 · work 2', 'active'), c('Payment in A1', 'Still on local A branch')),
          f('B overtakes', 'B3 makes B heavier. The node reorganizes; a payment present only in A1 is no longer confirmed.', c('Branch A', 'A1 and A2 displaced', 'warn'), c('Branch B', 'G → B1 → B2 → B3 · work 3', 'good'), c('Payment in A1', 'No longer confirmed', 'warn')),
        ] },
      ],
    },
  },
  {
    id: 'ppc', slug: 'peercoin', minutes: 9,
    dek: 'An early hybrid design asks whether coin ownership can replace most of the work used to secure a chain.',
    before: ['Bitcoin'], takeaway: 'Proof-of-stake changes the scarce resource. It does not, by itself, specify fork choice, finality, or protection against old-history attacks.',
    sections: [
      s('Read this as the 2012 design', [
        'Peercoin introduced an influential early proof-of-stake design alongside proof-of-work issuance. Its original paper uses coin age: the amount of coins multiplied by how long they have been held. A coinstake transaction consumes age and creates new outputs.',
        'Stake minting still checks a hash-based eligibility condition, but the search is constrained and weighted by stake-related parameters. Owning coins is not a license to sign an arbitrary block at any moment, and the oldest output does not deterministically win.',
      ], 0),
      s('Ownership replaces the resource contest', [
        'In proof-of-work, producing blocks draws on hashing resources. In the original Peercoin design, eligible owned coins provide a different scarce resource. Signatures demonstrate control of the staked output, and nodes validate the resulting block and coinstake transaction.',
        'This change targets the ongoing energy cost of securing the network. It also changes the attacks to consider. A stake-based history must handle competing branches and the possibility that old keys can sign alternative histories.',
      ], 0),
      s('Work through coin age', [
        'Our arithmetic example gives Alice 10 coins held for 40 days: 400 coin-days. Bob has 20 coins held for 30 days: 600 coin-days. These products illustrate age accounting only. They are not exact minting probabilities, and the walkthrough does not model the kernel, minimum ages, caps, or difficulty.',
        'When Alice’s eligible stake mints in the example, the age attached to that spent output is consumed. Waiting longer and spending an output are therefore different events. Switch scenarios to see that an ordinary spend also ends the old output’s accumulated age.',
      ]),
      s('The historical checkpoint trade-off', [
        'The 2012 paper includes centrally broadcast checkpoints to protect settled history. That is an explicit trust assumption, not a consequence of stake alone. This lesson describes that original design; it does not imply that every later Peercoin release has identical checkpoint policy or minting parameters.',
        'Keep the broader lesson when moving to Ethereum: two systems can both use proof-of-stake while having different proposer selection, fork choice, accountability, and finality rules. “PoS” names a resource choice, not a complete consensus protocol.',
      ], 0),
    ],
    tradeoffs: ['Historical checkpoints introduce trust in the checkpoint mechanism.', 'Coin-age and kernel rules require careful design; they do not establish the slashable finality used by later PoS protocols.'],
    papers: [{ title: 'PPCoin: Peer-to-Peer Crypto-Currency with Proof-of-Stake', authors: 'Sunny King & Scott Nadal', year: '2012', href: 'https://www.peercoin.net/papers/peercoin-paper.pdf', note: 'Historical design; later network rules may differ' }],
    quizzes: [q('Does the largest coin-age balance automatically produce the next block?', 'No; minting also requires satisfying the eligibility rules.', 'Yes; the oldest stake always wins.', 'Coin-age accounting is not a deterministic leader election.'), q('What additional history protection appears in the original paper?', 'Centrally broadcast checkpoints.', 'A two-thirds BFT finality vote.', 'The historical design states a checkpoint trust assumption, rather than deriving finality from BFT votes.')],
    walkthrough: {
      title: 'Track an output’s coin age', model: 'Historical coin-age arithmetic only. No kernel search, probability estimate, difficulty, or current-network parameter model is implied.',
      scenarios: [
        { name: 'Stake is used to mint', frames: [
          f('Age accumulates', 'The arithmetic is amount × days held. These are illustrative eligible outputs, not a race prediction.', c('Alice’s old output', '10 × 40 = 400 coin-days', 'active'), c('Bob’s old output', '20 × 30 = 600 coin-days', 'active'), c('Eligibility', 'Hash condition still required')),
          f('An eligible coinstake', 'Suppose Alice satisfies the minting condition. The example chooses this outcome; Bob’s larger product did not force Bob to win.', c('Alice’s old output', 'Used in coinstake', 'active'), c('Bob’s old output', 'Still unspent'), c('Eligibility', 'Alice’s check passed', 'good')),
          f('Age is consumed', 'The old output is spent. New outputs begin their own age; the consumed 400 coin-days are not reusable.', c('Alice’s old output', 'Spent; old age consumed', 'good'), c('Bob’s old output', 'Continues aging'), c('Eligibility', 'New outputs start fresh')),
        ] },
        { name: 'Stake is spent normally', frames: [
          f('Before a payment', 'Alice’s output has accumulated 400 coin-days.', c('Old output', '10 coins, 40 days', 'active'), c('Payment', 'Not sent'), c('New output', 'Does not exist')),
          f('Spend the output', 'A normal transaction consumes that output. Its existing age cannot be attached to a second spend.', c('Old output', 'Spent', 'warn'), c('Payment', 'Included in the chain', 'good'), c('New output', 'Created', 'active')),
          f('Age starts again', 'The new output ages from its own creation. This is output accounting, not a finality proof.', c('Old output', 'No reusable age'), c('Payment', 'Subject to chain settlement'), c('New output', 'Age starts at zero', 'good')),
        ] },
      ],
    },
  },
  {
    id: 'eth', slug: 'ethereum', minutes: 10,
    dek: 'Agreeing on transaction order lets a network run the same program and reproduce the same state.',
    before: ['Bitcoin'], takeaway: 'Consensus chooses a valid history; deterministic execution computes what that history means.',
    sections: [
      s('A blockchain that runs programs', [
        'Ethereum extends the blockchain idea to a general state machine. Accounts, balances, and contract storage form a shared state. Transactions invoke computations that transform that state. Honest nodes replay the same ordered transactions under the same execution rules.',
        'Ethereum launched in 2015 using proof-of-work. This family-tree entry describes that historical step. The Merge replaced proof-of-work with proof-of-stake in September 2022; the Gasper lesson covers the consensus design behind that transition.',
      ], 0),
      s('Ordering and execution answer different questions', [
        'Consider a contract with a counter initially equal to 2. Alice submits “add 3,” while Bob submits “multiply by 2.” Alice then Bob yields 10; Bob then Alice yields 7. Both commands are valid in this toy contract, but their order matters.',
        'Consensus determines the agreed transaction sequence. Execution applies that sequence. Nodes do not take a majority vote over whether 2+3 equals 5: they compute the result and reject a block whose claimed state transition violates the rules.',
      ]),
      s('Gas bounds the work', [
        'General computation needs resource limits. Gas measures execution work, and a transaction supplies a gas limit and pays under the protocol’s fee rules. An out-of-gas execution reverts its application-state effects while still charging for consumed gas; it is not necessarily an invalid block.',
        'This distinction matters when looking at a transaction receipt. A transaction can be included in the canonical history and have failed execution. “Included,” “successful,” and “finalized” answer three different questions.',
      ], 1),
      s('Read the historical fork-choice label carefully', [
        'The Ethereum node on the tree retains a probabilistic-settlement tag for its launch-era proof-of-work history. It should not be read as a claim that present-day Ethereum is still mined. The next Ethereum-family lesson separates current head selection from checkpoint finality.',
        'Try both transaction orders in the walkthrough. The result changes between scenarios, but every honest executor within one scenario reaches the same result. The model leaves out fees and account nonces to isolate ordering; real transactions must also satisfy those validity rules.',
      ]),
    ],
    tradeoffs: ['Programmability increases execution, storage, and verification costs.', 'Agreement on ordering does not make contract code correct or eliminate application-level bugs.'],
    papers: [
      { title: 'Ethereum Whitepaper', authors: 'Vitalik Buterin', year: '2014', href: 'https://ethereum.org/en/whitepaper/', note: 'Historical state-transition and application design' },
      { title: 'Gas and fees', authors: 'Ethereum documentation contributors', year: 'living documentation', href: 'https://ethereum.org/en/developers/docs/gas/' },
      { title: 'The Merge', authors: 'Ethereum documentation contributors', year: '2022', href: 'https://ethereum.org/en/roadmap/merge/', note: 'Proof-of-work to proof-of-stake transition' },
    ],
    quizzes: [q('What makes the counter example require ordering?', 'The two valid operations produce different results in different orders.', 'Honest nodes may use different arithmetic rules.', 'Determinism requires the same ordered inputs as well as the same execution rules.'), q('Does an included failed transaction imply an invalid block?', 'No; failed execution can be a valid recorded outcome.', 'Yes; every included transaction must succeed.', 'Execution status and block validity are separate; gas can be charged for failed execution.')],
    walkthrough: {
      title: 'Same operations, different order', model: 'A toy deterministic counter contract. Fees, account nonces, and EVM details are omitted; this illustrates ordering rather than proposer selection.',
      scenarios: [
        { name: 'Add, then multiply', frames: [
          f('Start from 2', 'Both honest nodes start with the same state and receive the agreed order: add 3, then multiply by 2.', c('Agreed order', '+3 → ×2', 'active'), c('Node A counter', '2'), c('Node B counter', '2')),
          f('Execute add 3', 'Each node applies the first operation: 2 + 3 = 5.', c('Agreed order', '+3 executed', 'active'), c('Node A counter', '5', 'active'), c('Node B counter', '5', 'active')),
          f('Execute multiply by 2', 'Each node applies the second operation: 5 × 2 = 10.', c('Agreed order', 'Both executed', 'good'), c('Node A counter', '10', 'good'), c('Node B counter', '10', 'good')),
        ] },
        { name: 'Multiply, then add', frames: [
          f('Start from 2', 'This alternate valid ordering reverses the operations.', c('Agreed order', '×2 → +3', 'active'), c('Node A counter', '2'), c('Node B counter', '2')),
          f('Execute multiply by 2', 'Each node applies 2 × 2 = 4.', c('Agreed order', '×2 executed', 'active'), c('Node A counter', '4', 'active'), c('Node B counter', '4', 'active')),
          f('Execute add 3', 'Each node applies 4 + 3 = 7. Agreement holds within this history, even though the other ordering produced 10.', c('Agreed order', 'Both executed', 'good'), c('Node A counter', '7', 'good'), c('Node B counter', '7', 'good')),
        ] },
      ],
    },
  },
  {
    id: 'ava', slug: 'avalanche', minutes: 11,
    dek: 'Repeated small polls can reinforce a shared preference without requiring every node to talk to every other node at each step.',
    before: ['Bitcoin', 'Byzantine Generals'], takeaway: 'A successful sample updates local confidence. It is not a quorum certificate from the whole validator set.',
    sections: [
      s('Ask a sample, then ask again', [
        'The Avalanche family explores repeated randomized sampling. A node queries a small sample of peers about conflicting choices, updates its preference from sufficiently strong responses, and repeats. Reinforcement can drive the system toward a stable choice with probabilistic safety.',
        'The family includes related mechanisms rather than one universal voting rule. Slush introduces preference reinforcement; Snowflake adds consecutive confidence; Snowball adds accumulated confidence. The original Avalanche design applies these ideas to a transaction DAG, while Snowman applies them to a chain.',
      ], 0),
      s('Three knobs to distinguish', [
        'A simplified Snowflake-style explanation uses sample size k, a success threshold α, and a confidence threshold β. A poll needs at least α matching responses to succeed. Consecutive successful polls for a preference build confidence toward β; a conflicting success or an unsuccessful poll changes that run.',
        'The walkthrough uses k=5, α=4, β=3 only to make the mechanism readable. These are deliberately tiny teaching values, not recommended security parameters. Three favorable polls in a real network would not, by itself, establish adequate safety.',
      ], 0),
      s('Watch the confidence reset', [
        'First follow three blue-majority polls. The local counter moves from zero to three and the toy node accepts blue. Then choose “mixed responses.” A poll with three blue and two orange responses misses the four-response threshold; it cannot count as another successful blue poll.',
        'Notice what is absent: no card says that four of all validators signed a globally transferable commit certificate. The observation is local and statistical. Security depends on sampling, adversarial influence, network behavior, and carefully chosen parameters.',
      ]),
      s('What sampling does and does not buy', [
        'Small polls reduce how many peers each node contacts in a polling round. That does not make total system communication a constant, and it does not eliminate the need to define participation weights or resist fake identities.',
        'Use the diagram to understand preference and confidence, not to measure reversal probability. The sample sequences are scripted, not drawn from a stake-weighted network. The primary paper provides the analysis; production rules and parameter choices belong to the implementation being evaluated.',
      ]),
    ],
    tradeoffs: ['Probabilistic guarantees require careful parameter selection and an explicit adversary model.', 'The toy confidence rule is only one member of the family; it must not be mistaken for every deployed Avalanche-chain rule.'],
    papers: [{ title: 'Scalable and Probabilistic Leaderless BFT Consensus through Metastability', authors: 'Team Rocket et al.', year: '2018 / revised 2020', href: 'https://arxiv.org/abs/1906.08936', note: 'Introduces the sampling family and its analysis' }],
    quizzes: [q('With k=5 and α=4, does a 3–2 poll succeed?', 'No; neither choice meets the threshold.', 'Yes; any simple majority is sufficient.', 'A successful poll must meet α, not merely exceed half the responses.'), q('Is one successful poll a global commit certificate?', 'No; it is a local sample used to update confidence.', 'Yes; it proves a network-wide supermajority.', 'Sampling protocols derive confidence over repeated polls under probabilistic assumptions.')],
    walkthrough: {
      title: 'Build confidence one poll at a time', model: 'Scripted Snowflake-style binary illustration: k=5, α=4, β=3. Not production parameters, Snowball’s full counter rules, or a statistical security estimate.',
      scenarios: [
        { name: 'Repeated blue support', frames: [
          f('Before polling', 'The toy node prefers blue, with no successful run yet.', c('Sample', 'Not queried'), c('Preference', 'Blue', 'active'), c('Consecutive confidence', '0 / 3')),
          f('Poll 1 succeeds', 'Four of five replies say blue, meeting α=4.', c('Sample', '4 blue · 1 orange', 'active'), c('Preference', 'Blue'), c('Consecutive confidence', '1 / 3', 'active')),
          f('Poll 2 succeeds', 'A fresh poll also supports blue. Confidence grows.', c('Sample', '5 blue · 0 orange', 'active'), c('Preference', 'Blue'), c('Consecutive confidence', '2 / 3', 'active')),
          f('Toy acceptance', 'A third consecutive successful blue poll reaches β=3 in this illustration only.', c('Sample', '4 blue · 1 orange'), c('Preference', 'Accept blue', 'good'), c('Consecutive confidence', '3 / 3', 'good')),
        ] },
        { name: 'Mixed responses', frames: [
          f('One blue success', 'The node has one successful blue poll so far.', c('Sample', '4 blue · 1 orange', 'active'), c('Preference', 'Blue'), c('Consecutive confidence', '1 / 3', 'active')),
          f('No threshold', 'Three blue replies do not reach α=4. The consecutive-success counter resets.', c('Sample', '3 blue · 2 orange', 'warn'), c('Preference', 'Still blue'), c('Consecutive confidence', '0 / 3', 'warn')),
          f('Orange succeeds', 'Four orange replies establish a new preferred color and a new run in this Snowflake-style example.', c('Sample', '1 blue · 4 orange', 'active'), c('Preference', 'Orange', 'active'), c('Consecutive confidence', '1 / 3', 'active')),
        ] },
      ],
    },
  },
  {
    id: 'gas', slug: 'gasper', minutes: 12,
    dek: 'Ethereum pairs a rule for choosing the current head with votes that finalize checkpoints in the history behind it.',
    before: ['Ethereum', 'Byzantine Generals'], takeaway: 'Head selection keeps the chain moving. Checkpoint finality gives a stronger promise about part of that chain.',
    sections: [
      s('Two questions inside one attestation', [
        'Gasper combines LMD-GHOST fork choice with Casper FFG checkpoint finality. An attestation participates in choosing a head and in linking a source checkpoint to a target checkpoint. These jobs are related, but a newly proposed head is not immediately a finalized checkpoint.',
        'The Gasper paper predates the Merge. The tree uses 2022 to mark Ethereum’s transition to proof-of-stake, not the first publication of the protocol. The original paper is an idealized model; the living specification defines deployed details.',
      ], 0),
      s('Head choice follows latest messages', [
        'LMD means latest-message-driven: each validator’s latest relevant vote contributes its weight. Starting from the permitted root, fork choice repeatedly follows the child with greater attesting weight in its subtree. It is not a global sort by block height or a count of every vote a validator has ever sent.',
        'Ethereum’s implementation includes additional rules such as proposer boost and checkpoint filters. The walkthrough isolates the conceptual distinction between a head that can change and checkpoints with stronger finality.',
      ], 1),
      s('Justify a target, finalize a source', [
        'In the simple consecutive-epoch case, a supermajority link from a justified checkpoint C0 to C1 justifies C1. A subsequent supermajority link from justified C1 to its next-epoch descendant C2 justifies C2 and finalizes C1. The votes are weighted by stake, with at least two-thirds required.',
        'This two-link example avoids the additional finalization patterns in the specification. It also avoids saying “two-thirds voted once, so this fresh checkpoint is final.” The distinction is exactly what the two checkpoint cards are meant to teach.',
      ], 1),
      s('When many validators go offline', [
        'Suppose only 60% of the currently counted stake attests. Blocks may continue to be proposed, but that participation is below two-thirds, so new supermajority links cannot form on that basis. The head can advance while recent checkpoints remain unfinalized.',
        'The walkthrough holds weights fixed to show the immediate failure mode. Ethereum also has an inactivity leak that changes effective balances during extended non-finality, enabling recovery under its assumptions. Conflicting finalized checkpoints imply slashable behavior by at least one-third of stake under the accountable-safety model; they are not ruled out by cryptography alone.',
      ], 1),
    ],
    tradeoffs: ['The freshest head has weaker guarantees than the finalized checkpoint behind it.', 'Stake accounting, slashing, inactivity recovery, and weak-subjectivity assumptions matter alongside quorum arithmetic.'],
    papers: [
      { title: 'Combining GHOST and Casper', authors: 'Buterin et al.', year: '2020', href: 'https://arxiv.org/abs/2003.03052', note: 'The idealized Gasper protocol' },
      { title: 'Gasper', authors: 'Ethereum documentation contributors', year: 'living documentation', href: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/gasper/' },
      { title: 'Beacon chain consensus specifications', authors: 'Ethereum consensus-specs contributors', year: 'living specification', href: 'https://github.com/ethereum/consensus-specs', note: 'Fork choice and justification/finalization rules' },
    ],
    quizzes: [q('Does a block being the current head make it finalized?', 'No; fork choice and finality have different conditions.', 'Yes; head means permanently committed.', 'LMD-GHOST chooses a head while FFG establishes checkpoint finality.'), q('In the consecutive-checkpoint example, C1 → C2 receives a supermajority after C1 is justified. What finalizes?', 'C1; C2 becomes justified.', 'C2 immediately, without another link.', 'The consecutive supermajority link finalizes the justified source checkpoint.')],
    walkthrough: {
      title: 'Keep head, justification, and finality separate', model: 'Consecutive checkpoints with fixed stake weights. C0 starts justified. Proposer boost, skipped-epoch finalization rules, and inactivity-leak recovery are omitted.',
      scenarios: [
        { name: 'Two successful links', frames: [
          f('A justified anchor', 'C0 is already justified. C1 and C2 are not yet justified.', c('Head', 'Blocks above C0', 'active'), c('C1', 'Not justified'), c('C2', 'Not justified')),
          f('C0 → C1 reaches two-thirds', 'A supermajority link justifies C1. C1 is not yet finalized by this event.', c('Head', 'Above C1', 'active'), c('C1', 'Justified', 'active'), c('C2', 'Not justified')),
          f('C1 → C2 reaches two-thirds', 'For consecutive epoch checkpoints, this link finalizes C1 and justifies C2.', c('Head', 'Above C2', 'active'), c('C1', 'Finalized', 'good'), c('C2', 'Justified', 'active')),
        ] },
        { name: 'Only 60% participates', frames: [
          f('Participation drops', 'C1 is justified but has not yet finalized. Forty percent of the counted stake is offline.', c('Head', 'At C2'), c('C1', 'Justified'), c('C2 link support', '60% < two-thirds', 'warn')),
          f('Blocks can continue', 'A later block becomes the head, but no supermajority link has arrived.', c('Head', 'New block above C2', 'active'), c('C1', 'Still not finalized', 'warn'), c('C2 link support', '60% < two-thirds', 'warn')),
          f('Finality is stalled', 'With these fixed weights and participation, time alone cannot finalize C1. Long-run inactivity recovery is outside this trace.', c('Head', 'May keep moving', 'active'), c('C1', 'Waiting for finality', 'warn'), c('C2 link support', 'Still insufficient', 'warn')),
        ] },
      ],
    },
  },
];
