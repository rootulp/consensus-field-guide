import { card as c, frame as f, section as s, quiz as q, type GuideLesson } from './types';

export const modern: GuideLesson[] = [
  {
    id: 'hs', slug: 'hotstuff', minutes: 12,
    dek: 'Collect votes into certificates, carry the highest evidence to a new leader, and pipeline the phases across blocks.',
    before: ['PBFT', 'Tendermint'], takeaway: 'A quorum certificate proves a voting milestone. One certificate does not make its block committed.',
    sections: [
      s('Move evidence through the leader', [
        'HotStuff is a leader-based BFT protocol for partial synchrony. With n=3f+1, a quorum certificate (QC) represents 2f+1 votes. Replicas send votes to a collector, and aggregated or threshold signatures can keep the certificate compact instead of forwarding a growing bundle of individual messages.',
        'Under the paper’s conditions, a correct leader can drive progress at actual network speed after synchrony. This optimistic responsiveness is a liveness property; safety still depends on voting and locking rules.',
      ], 0),
      s('Pipeline without skipping the commit rule', [
        'Basic HotStuff has prepare, pre-commit, and commit voting phases followed by a decision notification. Chained HotStuff overlaps those roles across successive proposals. A proposal can prepare new work while moving older work closer to commitment.',
        'The walkthrough uses a direct chain A → B → C → D. B carries QC(A), C carries QC(B), and D carries QC(C). On seeing that linked evidence, a replica can commit A. A visible chain of proposals without the corresponding certificates would not establish the same result.',
      ], 0),
      s('Try stopping the middle leader', [
        'First collect QC(A), then pause the leader who should extend A. No amount of waiting turns QC(A) into finality. A later leader needs the appropriate highest-QC evidence, while replicas keep their safety state.',
        'This fault trace deliberately stops at recovery. It does not invent a commit across a gap. The detailed chained rule checks certificate ancestry, and the paper distinguishes its simplified consecutive-view formulation from implementation refinements.',
      ]),
      s('Why the third phase helps', [
        'The extra phase is not just redundant reassurance. It helps arrange the lock and certificate information so a new honest leader can make progress without waiting out a worst-case delay bound on its normal path. A pacemaker still coordinates views and handles failed leaders.',
        'When comparing HotStuff descendants, check the exact variant. Some change phase counts, commit rules, or recovery behavior. A benchmark or diagram labeled “HotStuff” is not enough to infer those details.',
      ], 0),
    ],
    tradeoffs: ['Compact certificates reduce communication overhead but require cryptographic aggregation infrastructure.', 'Pipelining improves steady-state throughput while a single block still passes multiple voting milestones.'],
    papers: [{ title: 'HotStuff: BFT Consensus in the Lens of Blockchain', authors: 'Yin, Malkhi, Reiter, Gueta & Abraham', year: '2018 / 2019', href: 'https://arxiv.org/abs/1803.05069', note: 'Sections 4–6 distinguish Basic and Chained HotStuff' }],
    quizzes: [q('Does QC(A) alone commit A in Chained HotStuff?', 'No; linked later certificates must satisfy the commit rule.', 'Yes; any quorum certificate is finality.', 'Certification and commitment are different milestones.'), q('What must a replacement leader use?', 'Certificate evidence consistent with the replicas’ safety rules.', 'Only its own preferred unverified branch.', 'Leader rotation carries evidence across views; it does not reset safety state.')],
    walkthrough: {
      title: 'Follow the certificate chain', model: 'Original three-phase Chained HotStuff, direct ancestry and consecutive successful views in the normal case. QCs are assumed valid, with three of four votes.',
      scenarios: [
        { name: 'Pipeline succeeds', frames: [
          f('A is proposed', 'A has not yet collected a QC.', c('A', 'Proposed', 'active'), c('B', 'Not proposed'), c('C', 'Not proposed'), c('D', 'Not proposed')),
          f('B carries QC(A)', 'A’s votes form QC(A). B extends A and carries that evidence.', c('A', 'Certified; not committed', 'active'), c('B', 'Carries QC(A)', 'active'), c('C', 'Not proposed'), c('D', 'Not proposed')),
          f('C carries QC(B)', 'The next certificate extends the pipeline. A still waits for the final link.', c('A', 'Not committed'), c('B', 'Certified', 'active'), c('C', 'Carries QC(B)', 'active'), c('D', 'Not proposed')),
          f('D carries QC(C)', 'D exposes three direct QC links through C and B to A. The commit rule now commits A.', c('A', 'Committed', 'good'), c('B', 'Certified; waiting'), c('C', 'Certified', 'active'), c('D', 'Carries QC(C)', 'active')),
        ] },
        { name: 'Next leader is silent', frames: [
          f('A has a QC', 'Replicas know QC(A), but later certificate links do not yet exist.', c('A', 'Certified; not committed', 'active'), c('Next leader', 'Expected to extend A'), c('Pacemaker', 'Waiting')),
          f('No next proposal', 'The leader is silent. A’s QC remains useful but does not become a commit.', c('A', 'Still not committed'), c('Next leader', 'Silent', 'warn'), c('Pacemaker', 'Timeout', 'warn')),
          f('Recover with evidence', 'A new leader collects new-view information and proposes from suitable QC evidence. Further certified links are still needed.', c('A', 'QC retained', 'good'), c('Next leader', 'Replaced', 'active'), c('Pacemaker', 'New view; locks preserved', 'active')),
        ] },
      ],
    },
  },
  {
    id: 'nb', slug: 'narwhal-bullshark', minutes: 12,
    dek: 'Spread transaction data in parallel, then interpret a shared graph to agree on an order.',
    before: ['PBFT', 'HotStuff'], takeaway: 'Availability answers “can honest replicas retrieve it?” Ordering answers “where does it go?” A certificate for the first is not a decision about the second.',
    sections: [
      s('Separate the heavy work', [
        'Narwhal separates transaction dissemination from ordering. Workers spread transaction batches; primaries build certified vertices that refer to batches and earlier certificates. This directed acyclic graph (DAG) records a causal history while many producers contribute data concurrently.',
        'A quorum certificate for a vertex establishes availability under the protocol’s storage and fault assumptions. It does not impose a total order on all independently produced vertices. Narwhal can therefore serve as a data layer for different ordering protocols.',
      ], 0),
      s('Let graph edges carry ordering evidence', [
        'Bullshark uses the DAG’s structure to reach agreement without a separate stream of consensus votes beyond constructing the graph. Its commit rules interpret support for designated vertices; deterministic traversal then orders the relevant causal history.',
        'The paper presents an asynchronous protocol and a simpler partially synchronous version. This lesson teaches their shared separation of responsibilities, rather than mixing their exact commit thresholds into a fictitious hybrid algorithm. Narwhal appeared in 2021; Bullshark followed in 2022.',
      ], 1),
      s('A certificate is not an ordering ticket', [
        'Imagine A and B each publish a batch in the same round. Availability certificates make both retrievable, but do not decide whether A comes before B. A later supported anchor can include both in its causal history; a fixed traversal rule resolves their order consistently.',
        'The diagram uses A-before-B as an illustrative tie-break. It is not a claim that every Bullshark implementation sorts by these labels. The important property is that all honest replicas apply the same prescribed traversal to the committed history.',
      ]),
      s('Withhold one producer’s batch', [
        'In the fault scenario, C advertises data it never makes available. Honest replicas do not provide the evidence needed to certify it. A and B can continue disseminating, so the slow producer need not become the sole data conduit for the whole system.',
        'This does not mean missing data is harmless in every network state. Progress still requires enough honest participants and the timing or randomness assumptions of the chosen ordering protocol. Storage, garbage collection, and catch-up rules are also essential parts of the data layer.',
      ], 0),
    ],
    tradeoffs: ['Parallel dissemination improves use of bandwidth but adds DAG storage, certificate, and garbage-collection work.', 'The exact Bullshark variant determines the liveness assumptions and commit rule.'],
    papers: [
      { title: 'Narwhal and Tusk: A DAG-based Mempool and Efficient BFT Consensus', authors: 'Danezis, Kokoris-Kogias, Sonnino & Spiegelman', year: '2021', href: 'https://arxiv.org/abs/2105.11827', note: 'Narwhal’s data layer; Tusk is a separate ordering protocol' },
      { title: 'Bullshark: DAG BFT Protocols Made Practical', authors: 'Spiegelman, Giridharan, Sonnino & Kokoris-Kogias', year: '2022', href: 'https://arxiv.org/abs/2201.05677', note: 'Asynchronous and partially synchronous variants' },
    ],
    quizzes: [q('Does a Narwhal availability certificate determine total order?', 'No; an ordering protocol must still decide placement.', 'Yes; a certificate immediately commits the batch’s position.', 'Availability and ordering are separate guarantees.'), q('Where does Bullshark find its ordering evidence?', 'In the structure and support relationships of the DAG.', 'In a proof-of-work race outside the DAG.', 'Bullshark interprets graph edges and applies its commit and traversal rules.')],
    walkthrough: {
      title: 'From available data to ordered history', model: 'A conceptual data-flow trace, not an executable Bullshark commit rule. “Anchor committed” assumes the selected variant’s support conditions have been met.',
      scenarios: [
        { name: 'Parallel batches', frames: [
          f('Publish concurrently', 'Producers A and B spread batches independently. Neither has an ordering position yet.', c('Batch A', 'Disseminating', 'active'), c('Batch B', 'Disseminating', 'active'), c('Ordered log', 'Empty')),
          f('Certify availability', 'Both batches are represented by certified vertices. Their relative order is still undecided.', c('Batch A', 'Available; unordered', 'active'), c('Batch B', 'Available; unordered', 'active'), c('Ordered log', 'Still empty')),
          f('Commit an anchor', 'Assume Bullshark’s commit conditions select an anchor whose causal history includes A and B.', c('Batch A', 'In anchor history', 'good'), c('Batch B', 'In anchor history', 'good'), c('Ordered log', 'Traverse committed history', 'active')),
          f('Apply a deterministic order', 'Both replicas use the same traversal. This illustration chooses A then B.', c('Batch A', 'Position 1', 'good'), c('Batch B', 'Position 2', 'good'), c('Ordered log', 'A → B', 'good')),
        ] },
        { name: 'Producer C withholds data', frames: [
          f('Three advertised batches', 'A and B distribute their data; C sends a reference but withholds its payload.', c('Batch A', 'Payload received', 'active'), c('Batch B', 'Payload received', 'active'), c('Batch C', 'Payload missing', 'warn')),
          f('Only available data certifies', 'Honest replicas do not certify C’s unavailable data. A and B obtain availability evidence.', c('Batch A', 'Certified', 'good'), c('Batch B', 'Certified', 'good'), c('Batch C', 'No availability certificate', 'warn')),
          f('Useful history can continue', 'Given sufficient honest DAG progress, later ordering can include A and B without treating C’s bare reference as available.', c('Batch A', 'Eligible for ordering', 'good'), c('Batch B', 'Eligible for ordering', 'good'), c('Batch C', 'Still excluded', 'warn')),
        ] },
      ],
    },
  },
  {
    id: 'raptr', slug: 'raptr', minutes: 13,
    dek: 'Vote for the prefix you have, certify availability with one threshold, and commit a compatible prefix with another round of evidence.',
    before: ['HotStuff', 'Narwhal & Bullshark'], takeaway: 'Raptr avoids fetching every proposed batch before voting. It does not let replicas commit an arbitrary subset of a proposal.',
    sections: [
      s('The missing-tail problem', [
        'A producer can send transaction batches directly while a leader proposes their digests. This avoids waiting for every batch to obtain an availability certificate first. But if voting requires all proposed data, one withheld batch can put fetching back on the critical path.',
        'Raptr lets replicas report the longest available prefix of the proposal’s uncertified batch list. Prefixes are nested: [A,B] extends [A]. An arbitrary subset such as [A,C] does not preserve that ordering structure.',
      ], 0),
      s('Availability and commit are different thresholds', [
        'For n=3f+1, a QC contains 2f+1 QC-votes. Its certified prefix is the S-th largest reported prefix, with S at least f+1. This ensures at least one honest holder for the certified prefix. The subsequent commit certificate contains a quorum of CC-votes and commits their minimum certified prefix.',
        'The next proposal must extend the appropriate maximum certified prefix from the commit or timeout evidence. Committing the minimum and extending the maximum preserves containment through quorum overlap. A full-prefix QC also permits progression under the protocol’s rules.',
      ], 0),
      s('Calculate a concrete prefix', [
        'Use four replicas, f=1, and S=2. Suppose a QC’s three votes report prefix lengths [3,2,2] for the proposal [A,B,C]. The second-largest value is 2, so this QC certifies [A,B]. C is not certified by that QC.',
        'If a later commit certificate contains three valid CC-votes whose certified lengths are [2,2,2], its minimum is 2 and [A,B] commits. Compare the full-prefix scenario: QC-votes [3,3,1] can certify length 3 with S=2, even though one voter initially lacks most data.',
      ]),
      s('What this lesson intentionally leaves out', [
        'The trace displays a valid certificate calculation, not a complete network scheduler. It omits the separate handling of already-certified batches, verification of parent proofs, timeout messages, and restrictions on updated votes. Those checks belong to the full protocol.',
        'The paper’s Baby Raptr and full Raptr are also distinct designs. A production announcement for one is not evidence that every mechanism or benchmark of the other is deployed. This lesson follows the full Raptr paper, version 2.',
      ]),
    ],
    tradeoffs: ['Prefix voting tolerates incomplete data, but a missing early batch can limit the useful prefix of that proposal.', 'Retrieval guarantees, safe parent selection, and a second voting stage remain necessary.'],
    papers: [{ title: 'Raptr: Prefix Consensus for Robust High-Performance BFT', authors: 'Tonkikh, Arun, Xiang, Li & Spiegelman', year: '2025', href: 'https://arxiv.org/html/2504.18649v2', note: 'Section 5.2: QC extraction, CC-votes, and round transitions' }],
    quizzes: [q('With S=2 and reported lengths [3,2,2], what prefix does the QC certify?', 'Length 2: the second-largest report.', 'Length 3: the largest report.', 'The S-th-largest prefix guarantees the required number of holders.'), q('What prefix does a commit certificate select from its CC-votes?', 'The minimum certified prefix.', 'An arbitrary union of every reported batch.', 'Nested prefixes and conservative commitment preserve a compatible history.')],
    walkthrough: {
      title: 'Calculate what can safely commit', model: 'Full Raptr v2; n=4, f=1, S=2. The proposal is [A,B,C]. Each listed QC or CC has three distinct valid voters; signatures and parent checks are assumed.',
      scenarios: [
        { name: 'Tail C is missing', frames: [
          f('Report available prefixes', 'Three QC-voters report the longest prefix they hold. Two do not have C.', c('QC-vote lengths', '3 · 2 · 2', 'active'), c('Certified prefix', 'Not computed'), c('Committed prefix', 'None')),
          f('Extract the QC', 'Sort descending and take the second value: 2. At least two voters hold A and B.', c('QC-vote lengths', '3 · [2] · 2', 'active'), c('Certified prefix', '[A, B]', 'active'), c('Committed prefix', 'None')),
          f('Collect CC-votes', 'Three valid CC-votes for this example each certify prefix 2. Their minimum is 2.', c('QC-vote lengths', 'QC retained'), c('Certified prefix', 'CC lengths: 2 · 2 · 2', 'active'), c('Committed prefix', '[A, B]; C deferred', 'good')),
        ] },
        { name: 'Two hold the full prefix', frames: [
          f('Different data arrival', 'Two QC-voters hold all three batches. One holds only A.', c('QC-vote lengths', '3 · 3 · 1', 'active'), c('Certified prefix', 'Not computed'), c('Committed prefix', 'None')),
          f('Full-prefix QC', 'The second-largest length is 3. At least one of those two full-prefix holders is honest when f=1.', c('QC-vote lengths', '3 · [3] · 1', 'active'), c('Certified prefix', '[A, B, C]', 'good'), c('Committed prefix', 'Not yet committed')),
          f('Commit the certified prefix', 'With valid CC-votes certifying [3,3,3], the commit certificate’s minimum is 3.', c('QC-vote lengths', 'QC retained'), c('Certified prefix', 'CC lengths: 3 · 3 · 3', 'active'), c('Committed prefix', '[A, B, C]', 'good')),
        ] },
      ],
    },
  },
  {
    id: 'mmx', slug: 'multimmit', minutes: 13,
    dek: 'A draft protocol combines one-round consensus votes with per-producer positions, so one missing chain need not suppress useful blocks on every other chain.',
    before: ['Minimmit', 'Raptr'], takeaway: 'Per-chain support determines which tips are finalized and which are safe to extend. Those are different extraction rules.',
    sections: [
      s('Read this as a draft-paper lesson', [
        'Multimmit extends the Minimmit line to parallel producer chains with n≥5f+1. A leader proposes positions on those chains. Votes report supported positions relative to that proposal, and can attest fresh extension blocks. This lesson follows the July 2026 draft, not a deployed-system specification.',
        'A voter missing data on one chain can report a lower position there while supporting other chains. The visual example holds two producer chains side by side so this distinction is visible.',
      ], 0),
      s('Two certificates, two tip rules', [
        'An L-QC contains n−f votes for one leader block. Among proposed positions, a finalized tip needs support from at least 3f+1 of those votes. A V-QC accounts for n−f distinct processors using votes or novote messages, with at least 2f+1 votes for a designated proposal; its safe-to-extend proposed tips use f+1 supporting votes.',
        'For n=6 and f=1, five same-proposal votes form an L-QC. A proposed chain position needs four supports to finalize, while two supports suffice for the V-QC’s safe-to-extend rule. Do not substitute Minimmit’s bare three-vote progression certificate here.',
      ], 0),
      s('Try independent positions', [
        'Suppose the proposal lists A1,A2 on chain A and B1,B2 on chain B. Five votes report A positions [2,2,2,2,1] and B positions [2,1,1,1,1]. Four voters support A2, so A’s finalized tip is 2. Only one supports B2; B’s finalized tip is 1. The missing B2 does not lower A’s finalized tip.',
        'In the alternate scenario, three voters support A2. Its finalized tip is only 1, but its safe-to-extend tip is 2. Finalized membership, the safe frontier for a later proposal, and placement in the total log must not be collapsed into one green badge.',
      ]),
      s('Extensions need their own rules', [
        'Fresh blocks beyond proposed positions are not identified by a shared proposal path. Their support must be counted by actual branch, not height alone. At n=5f+1, the draft’s immediate extension-finalization rule requires all n−f votes in an L-QC to attest that extension and the chain’s finalized position to reach its proposed tip.',
        'The walkthrough therefore computes proposed-position tips only. It does not simulate extensions or the ordering sweep. The draft distinguishes membership finality from total-order placement; a lagging chain slot can delay placement even when another chain’s block is already guaranteed inclusion.',
      ], 0),
    ],
    tradeoffs: ['The fault bound remains below one-fifth, and certificate/extraction rules are more involved than a single threshold.', 'The draft’s latency claims depend on its timing and leader assumptions; membership finality is not always immediate total-order placement.'],
    papers: [{ title: 'Multimmit: Extending Blocks for Faster Finality (draft)', authors: 'Andrew Lewis-Pye & Patrick O’Grady', year: 'July 2026, v1', href: 'https://arxiv.org/html/2607.21021v1', note: 'Sections 3.4–3.5 and 4: proposed positions, extensions, and ordering' }],
    quizzes: [q('With f=1, how many L-QC votes must support a proposed position to finalize that tip?', 'Four: 3f+1.', 'Two: f+1.', 'The smaller threshold extracts safe-to-extend proposed positions; it is not the finalization threshold.'), q('Does a lower supported position on chain B force chain A’s tip down too?', 'No; proposed-position support is extracted per chain.', 'Yes; all producer chains must share one prefix length.', 'Per-chain extraction is what isolates missing data; total-order placement is a separate step.')],
    walkthrough: {
      title: 'Extract tips independently for each producer', model: 'Draft v1, n=6 and f=1; five valid same-proposal votes also satisfy the V-QC composition requirement. Proposed positions only; no extensions or total-order sweep.',
      scenarios: [
        { name: 'B2 withheld from most voters', frames: [
          f('The proposal', 'The leader references two positions on each producer’s chain.', c('Chain A', 'A1 → A2', 'active'), c('Chain B', 'B1 → B2', 'active'), c('Certificate', 'Awaiting five votes')),
          f('Five position reports', 'Four voters have A2, but only one has B2. Each reports a position independently on each chain.', c('Chain A', '2 · 2 · 2 · 2 · 1', 'active'), c('Chain B', '2 · 1 · 1 · 1 · 1', 'warn'), c('Certificate', '5 votes: L-QC', 'good')),
          f('Extract finalized tips', 'Use the fourth-largest position (3f+1=4). A finalizes through A2; B through B1.', c('Chain A', 'Finalized tip: A2', 'good'), c('Chain B', 'Finalized tip: B1', 'good'), c('Certificate', 'Membership tips; ordering separate')),
          f('Extract safe-to-extend tips', 'Use the second-largest position (f+1=2) for this V-QC. The safe tips are also A2 and B1.', c('Chain A', 'Safe to extend: A2', 'good'), c('Chain B', 'Safe to extend: B1', 'good'), c('Certificate', 'Later proposal preserves these tips', 'active')),
        ] },
        { name: 'Safe frontier ahead of finality', frames: [
          f('Fewer voters have A2', 'Five valid votes report these proposed positions.', c('Chain A', '2 · 2 · 2 · 1 · 1', 'active'), c('Chain B', '1 · 1 · 1 · 1 · 1'), c('Certificate', '5 votes: L-QC', 'good')),
          f('Finalized tip stays at A1', 'The fourth-largest A position is 1. Three supports for A2 are not four.', c('Chain A', 'Finalized tip: A1', 'good'), c('Chain B', 'Finalized tip: B1', 'good'), c('Certificate', 'A2 not finalized here', 'warn')),
          f('Carry A2 forward safely', 'The second-largest A position is 2. The same votes yield a V-QC whose next proposal must preserve A2 as safe to extend.', c('Chain A', 'Safe to extend: A2', 'active'), c('Chain B', 'Safe to extend: B1'), c('Certificate', 'Safe frontier can lead finality', 'active')),
        ] },
      ],
    },
  },
];
