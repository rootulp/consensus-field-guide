import { card as c, frame as f, section as s, quiz as q, type GuideLesson } from './types';

export const foundations: GuideLesson[] = [
  {
    id: 'bg', slug: 'byzantine-generals', minutes: 10,
    dek: 'Before choosing a protocol, decide what agreement means when participants can tell different stories.',
    before: [], takeaway: 'Agreement constrains honest participants. A faulty participant can say anything, including different things to different peers.',
    sections: [
      s('The problem before the protocol', [
        'Imagine several operators coordinating a database migration. Starting together is useful; starting on only half the machines is dangerous. Messages may pass through an operator who sends “start” to one colleague and “wait” to another. This is a Byzantine fault: arbitrary behavior, rather than simply stopping.',
        'The Byzantine Generals paper asks for agreement among loyal lieutenants, and for them to follow the commander when the commander is loyal. These are separate requirements: everyone always choosing “wait” could satisfy agreement while ignoring an honest command.',
      ], 0),
      s('Why relaying helps', [
        'In the four-general, one-traitor oral-message example, the commander sends an order to three lieutenants. They relay what they received. Each loyal lieutenant then takes a majority over the commander’s direct order and the two relayed reports. A missing report uses an agreed default.',
        'Try the dishonest-commander walkthrough. A and B receive “start,” while C receives “wait.” After relaying, all three loyal lieutenants see the same two-to-one distribution. They can agree even though the original command was inconsistent.',
      ], 0),
      s('Why the assumptions matter', [
        'Oral messages identify the sender but cannot carry an unforgeable proof of what another sender said. In that model, tolerating f traitors requires more than 3f participants. The paper also studies signed messages, where the bound differs. “Every consensus system needs 3f+1 nodes” is therefore too broad.',
        'This lesson uses synchronous rounds with detectable missing messages. Later lessons add uncertain network timing, signatures, persistent logs, and changing leaders. A count of machines alone does not establish a safety guarantee.',
      ], 0),
      s('Read the diagram as evidence', [
        'Switch between a dishonest commander and a dishonest lieutenant. In the first case, agreement matters even though no honest initial order exists. In the second, the honest commander’s instruction must survive a false relay. The four cards keep these two obligations visible.',
        'As you read later protocols, ask three questions: who may lie, what evidence can be forwarded, and what must two honest participants never disagree about? Those questions are more useful than memorizing a quorum percentage.',
      ]),
    ],
    tradeoffs: ['Recursive relaying becomes expensive as the fault bound grows.', 'The oral-message result relies on synchrony and known membership; it is not a permissionless blockchain design.'],
    papers: [{ title: 'The Byzantine Generals Problem', authors: 'Lamport, Shostak & Pease', year: '1982', href: 'https://lamport.azurewebsites.net/pubs/byz.pdf', note: 'Sections 2–4 distinguish oral and signed messages' }],
    quizzes: [q('Must a dishonest commander’s intended order win?', 'No; loyal lieutenants must agree with each other.', 'Yes; any message signed by the commander must win.', 'Validity follows an honest commander; a dishonest commander may send no consistent order.'), q('Does the 3f+1 bound apply without specifying the model?', 'No; authentication and timing assumptions matter.', 'Yes; it is a universal law of consensus.', 'The oral-message lower bound is conditional on its communication and fault model.')],
    walkthrough: {
      title: 'Follow an order through the relays', model: 'The OM(1) example: four generals, at most one traitor, synchronous oral messages. Start and wait are just two possible values.',
      scenarios: [
        { name: 'Commander lies', frames: [
          f('Conflicting orders', 'The faulty commander sends start to A and B, but wait to C. No lieutenant can decide from its direct message alone.', c('Commander', 'Faulty: sends both orders', 'warn'), c('A', 'Received start', 'active'), c('B', 'Received start', 'active'), c('C', 'Received wait', 'warn')),
          f('Lieutenants relay', 'Each loyal lieutenant forwards exactly the order it received. All three now see the same vector.', c('Commander', 'No further authority', 'warn'), c('A', 'start · start · wait', 'active'), c('B', 'start · start · wait', 'active'), c('C', 'start · start · wait', 'active')),
          f('One decision', 'The majority is start. The loyal lieutenants agree even though the commander lied.', c('Commander', 'May still disagree', 'warn'), c('A', 'Decides start', 'good'), c('B', 'Decides start', 'good'), c('C', 'Decides start', 'good')),
        ] },
        { name: 'Lieutenant C lies', frames: [
          f('Honest command', 'The commander sends start to everyone. This time validity requires the loyal lieutenants to follow it.', c('Commander', 'Sends start', 'good'), c('A', 'Received start', 'active'), c('B', 'Received start', 'active'), c('C', 'Faulty lieutenant', 'warn')),
          f('A false relay', 'C relays wait to A and B. Each still has the direct start order and an honest peer’s start report.', c('Commander', 'Original: start', 'good'), c('A', 'start · start · wait', 'active'), c('B', 'start · start · wait', 'active'), c('C', 'Relays wait', 'warn')),
          f('Validity preserved', 'A and B decide start. The algorithm makes no promise about C’s own output.', c('Commander', 'Honest order followed', 'good'), c('A', 'Decides start', 'good'), c('B', 'Decides start', 'good'), c('C', 'Unconstrained', 'warn')),
        ] },
      ],
    },
  },
  {
    id: 'dls', slug: 'partial-synchrony', minutes: 10,
    dek: 'A timeout is a reason to try another leader, not proof that a missing message never existed.',
    before: ['Byzantine Generals'], takeaway: 'Safety must survive arbitrary delays. Liveness can wait for a sufficiently well-behaved network.',
    sections: [
      s('The missing middle', [
        'A synchronous model provides known bounds on message and processing delays. A fully asynchronous model provides no such timing bound. Real deployments often operate between these extremes: latency is usually manageable, but an outage can last longer than any timeout configured in advance.',
        'Dwork, Lynch, and Stockmeyer formalized partial synchrony. One formulation has a bound that exists but is unknown; another has a known bound that holds only after an unknown stabilization time. Protocols must work without an oracle announcing that the favorable period has begun.',
      ], 0),
      s('Two promises, two clocks', [
        'Safety means that bad outcomes, such as two conflicting committed values, do not occur. Liveness means that a requested decision eventually happens. A safe system can stop during a partition; a live-looking system that gives incompatible answers has not solved consensus.',
        'The walkthrough separates a decision register from a network clock. Before stabilization, a delayed vote may arrive after a timeout. Advancing the clock cannot justify erasing a decision that was already committed. The safety rules must carry across the leader change.',
      ], 0),
      s('Work through a timeout', [
        'Suppose a leader proposes X and its vote messages take five seconds. A two-second timeout expires. From one replica’s perspective, the leader might have crashed, the network might be slow, or another replica might already have received enough votes. These possibilities look identical locally.',
        'Switch to the recovered-network scenario. When a suitable leader, adequate timeouts, and timely communication align, votes can complete. This is the point of waiting for eventual synchrony: the protocol gains an opportunity to finish without weakening its earlier safety obligations.',
      ]),
      s('What the result does not say', [
        'Partial synchrony does not say “every request completes within one timeout.” Before stabilization, the delay may be arbitrarily long. It also does not provide a clock synchronization service or a formula that predicts when an outage ends.',
        'Use this lesson when comparing latency claims. A paper’s good-case latency usually assumes a favorable leader and timely network; a liveness theorem describes eventual progress under stated conditions. Neither should silently become an unconditional service-level promise.',
      ]),
    ],
    tradeoffs: ['Timeouts that are too short cause unnecessary leader changes; longer ones make real failures slower to recover from.', 'Availability can pause during a partition even while safety remains intact.'],
    papers: [{ title: 'Consensus in the Presence of Partial Synchrony', authors: 'Dwork, Lynch & Stockmeyer', year: '1988', href: 'https://groups.csail.mit.edu/tds/papers/Lynch/jacm88.pdf', note: 'The timing models and their resilience bounds' }],
    quizzes: [q('A timeout expires. What has the replica learned?', 'Its waiting deadline passed; the cause is uncertain.', 'The leader definitely crashed.', 'A slow message and a crashed sender can look identical locally.'), q('What should happen to safety before stabilization?', 'It must still hold under the protocol’s fault assumptions.', 'It only starts once the network settles.', 'Eventual synchrony enables progress, not permission to make conflicting earlier decisions.')],
    walkthrough: {
      title: 'Separate waiting from deciding', model: 'A conceptual timing trace, not a DLS implementation. The decision register represents a safe consensus protocol’s durable outcome.',
      scenarios: [
        { name: 'Network remains slow', frames: [
          f('Proposal sent', 'A leader sends X. The network has not stabilized, so delivery may be delayed.', c('Network', 'Delay unknown', 'warn'), c('Timer', '0 of 2 seconds'), c('Decision', 'None')),
          f('Deadline passes', 'The timeout expires without a quorum. This does not prove that nobody received X.', c('Network', 'Votes still delayed', 'warn'), c('Timer', '2 seconds: expired', 'warn'), c('Decision', 'None')),
          f('Try another leader safely', 'A later leader must obey the protocol’s certificate or lock rules. A timeout alone cannot authorize a conflicting commit.', c('Network', 'Still no bound', 'warn'), c('Timer', 'New attempt', 'active'), c('Decision', 'Wait for safe evidence')),
        ] },
        { name: 'Network recovers', frames: [
          f('An unsuccessful attempt', 'There is no decision yet. A partition delayed the earlier votes.', c('Network', 'Partition', 'warn'), c('Timer', 'Expired', 'warn'), c('Decision', 'None')),
          f('Timely communication resumes', 'The favorable period begins, but replicas receive no special stabilization notification.', c('Network', 'Messages now timely', 'good'), c('Timer', 'Long enough this attempt', 'active'), c('Decision', 'None')),
          f('A safe quorum completes', 'With a suitable leader and timely delivery, the protocol can decide X. The decision remains durable if latency rises again.', c('Network', 'Votes delivered', 'good'), c('Timer', 'Before deadline', 'good'), c('Decision', 'X committed', 'good')),
        ] },
      ],
    },
  },
  {
    id: 'px', slug: 'paxos', minutes: 12,
    dek: 'A new proposer first discovers what an earlier majority might have chosen, then preserves that value.',
    before: ['Partial synchrony'], takeaway: 'Majority overlap is useful because the overlapping acceptor remembers its promises and accepted value.',
    sections: [
      s('One slot, one value', [
        'Single-decree Paxos chooses one value among crash-prone machines. A proposer suggests values, acceptors persist promises and accepted proposals, and learners discover the chosen result. One process can perform several roles. Machines may stop; this model does not let them lie.',
        'With five acceptors, a quorum is three. Two such groups must overlap. That shared acceptor is the bridge from an old ballot to a new one, provided its state survives a restart.',
      ], 0),
      s('Prepare before accept', [
        'A proposer first sends prepare with a fresh, ordered ballot number. A responding acceptor promises not to accept smaller ballots and reports its highest accepted proposal. After a majority responds, the proposer must use the value from the highest reported accepted ballot, if any; otherwise it may choose its own value.',
        'The proposer then sends accept for that ballot and value. Acceptors obey their promises. A value is chosen once a majority accepts it, even if the proposer crashes before telling a learner.',
      ], 0),
      s('Try replacing a proposer', [
        'In the walkthrough, A, B, and C accept X at ballot 1. The proposer disappears. Ballot 2 prepares with C, D, and E. C reports X, so the new proposer cannot replace it with Y. The new accept quorum can differ from the old one; the value remains X.',
        'Now switch to competing proposers. One proposer’s prepare can prevent another’s lower-ballot accept from succeeding. Safety survives this interference, but progress may suffer. A stable leader is an operational answer to competition, not an exemption from the voting rules.',
      ]),
      s('From one choice to a log', [
        'A database needs many ordered decisions. Multi-Paxos applies agreement to log slots and can amortize preparation while a leader remains stable. Do not interpret that optimization as “preparation is optional whenever a leader feels confident.” Leader changes still need to preserve possible earlier decisions.',
        'When implementing or reviewing a replica, inspect the durable write boundary: a promise acknowledged before being safely stored may be forgotten after a crash. The lesson’s cards assume those writes succeed before replies are sent.',
      ], 0),
    ],
    tradeoffs: ['A majority must communicate for progress; a two-node minority of five cannot choose a value.', 'Correctness depends on durable acceptor state and unique ordered ballots; Byzantine faults require a different protocol.'],
    papers: [{ title: 'Paxos Made Simple', authors: 'Leslie Lamport', year: '2001', href: 'https://lamport.azurewebsites.net/pubs/paxos-simple.pdf', note: 'Sections 2–3 explain single-decree Paxos and replicated state machines' }],
    quizzes: [q('A prepare quorum reports an accepted value. What may the proposer do?', 'Use the value from the highest reported accepted ballot.', 'Always replace it with its own preferred value.', 'The prepare phase carries possible earlier decisions into the new ballot.'), q('Is a value unchosen if the proposer crashes after a majority accepts?', 'No; it is chosen even if learners have not heard yet.', 'Yes; the proposer must announce it first.', 'Choosing a value and learning that it was chosen are distinct events.')],
    walkthrough: {
      title: 'Carry a value across ballots', model: 'Five acceptors; quorum three; one log slot. Cards group acceptors to show quorum intersection. All promises and accepted values are durable.',
      scenarios: [
        { name: 'Proposer crashes', frames: [
          f('Ballot 1 accepted', 'A, B, and C accepted X: three acceptors means X is chosen.', c('A + B', 'Accepted (1, X)', 'good'), c('C', 'Accepted (1, X)', 'good'), c('D + E', 'Nothing accepted')),
          f('Ballot 2 prepares', 'The new proposer contacts C, D, E. C reports its accepted X; D and E report none.', c('A + B', 'Accepted (1, X)', 'good'), c('C', 'Promise 2; reports X', 'active'), c('D + E', 'Promise 2; report none', 'active')),
          f('X survives', 'The proposer sends accept(2, X). A second majority accepts the same value.', c('A + B', 'Accepted (1, X)', 'good'), c('C', 'Accepted (2, X)', 'good'), c('D + E', 'Accepted (2, X)', 'good')),
        ] },
        { name: 'Proposers compete', frames: [
          f('First prepare', 'A, B, and C promise ballot 7, but no accept has arrived.', c('A + B', 'Promise 7', 'active'), c('C', 'Promise 7', 'active'), c('D + E', 'No promise')),
          f('A larger ballot arrives', 'C, D, and E promise ballot 8 before ballot 7 completes.', c('A + B', 'Promise 7'), c('C', 'Promise 8', 'warn'), c('D + E', 'Promise 8', 'active')),
          f('Lower ballot cannot finish', 'Only A and B can now accept ballot 7. Two is short of a majority. Repeated preemption can delay progress.', c('A + B', 'Can accept 7: only two', 'warn'), c('C', 'Rejects 7', 'warn'), c('D + E', 'Reject 7', 'warn')),
        ] },
      ],
    },
  },
  {
    id: 'pbft', slug: 'pbft', minutes: 12,
    dek: 'Turn Byzantine agreement into a replicated service with ordered requests, quorum evidence, and safe leader replacement.',
    before: ['Byzantine Generals', 'Partial synchrony'], takeaway: 'A primary assigns an order; replicas verify and vote. Replacing the primary must preserve evidence of earlier progress.',
    sections: [
      s('From agreement to a service', [
        'PBFT assumes a known group of replicas and tolerates up to f Byzantine faults among 3f+1 replicas. Clients send requests to a primary, which proposes a sequence number and request digest. Replicas execute committed requests in order, so an honest service produces consistent results.',
        'The contribution is practical state machine replication under Byzantine faults, including normal operation, view changes, checkpoints, and recovery. A three-arrow diagram alone leaves out much of the protocol.',
      ], 0),
      s('Pre-prepare, prepare, commit', [
        'A valid pre-prepare binds a request digest to a view and sequence number. Backups multicast prepare messages. A replica becomes prepared with the matching pre-prepare and 2f prepares from distinct backups. It then multicasts commit.',
        'A prepared replica commits locally after 2f+1 matching commits, and executes after earlier sequence numbers are complete. A client waits for f+1 matching replies from distinct replicas, ensuring at least one honest reply.',
      ], 0),
      s('Why not stop after prepare?', [
        'Think of the two voting stages as gathering and preserving evidence. Preparation constrains which request can occupy a slot within a view. Commit evidence, together with the view-change rules, protects progress when a future primary takes over.',
        'In the four-replica walkthrough, a normal request passes through preparation and a three-replica commit set. In the fault case, the old primary is silent. The surviving replicas contribute state for a new view; simply electing another primary would not establish which earlier requests are safe to carry forward.',
      ]),
      s('A quorum is not unanimity', [
        'With f=1 and n=4, three replicas can commit while one is unavailable. Any two groups of three intersect in at least two replicas; at most one of those can be faulty. Honest behavior in the overlap is what blocks conflicting evidence.',
        'This arithmetic is a useful check, not a complete PBFT proof. The protocol also specifies what counts as a valid message, how messages are authenticated, and how sequence numbers and stable checkpoints limit the state replicas retain.',
      ], 0),
    ],
    tradeoffs: ['Prepare and commit involve all-to-all voting, which increases communication as membership grows.', 'View changes and checkpoint recovery are essential complexity, not optional cleanup.'],
    papers: [{ title: 'Practical Byzantine Fault Tolerance', authors: 'Miguel Castro & Barbara Liskov', year: '1999', href: 'https://pdos.csail.mit.edu/6.824/papers/castro-practicalbft.pdf', note: 'Section 4 covers normal operation and view changes' }],
    quizzes: [q('With four replicas and f=1, how many matching commits are required?', 'Three, after the replica is prepared.', 'Two; a simple half is enough.', 'PBFT requires 2f+1 matching commits, with the local prepared condition.'), q('Can a new primary ignore prepared information?', 'No; new-view selection must preserve the required evidence.', 'Yes; a new view starts an unrelated history.', 'Leader replacement must preserve safety across views.')],
    walkthrough: {
      title: 'An ordered request survives the primary', model: 'Four replicas, one possible fault, and one request X at sequence 10. The view-change trace summarizes evidence transfer, not the full selection algorithm.',
      scenarios: [
        { name: 'Normal request', frames: [
          f('Pre-prepare', 'P assigns X to sequence 10 in view 1. Backups validate that assignment.', c('Primary P', 'Proposes (1, 10, X)', 'active'), c('Backups A, B, C', 'Check proposal', 'active'), c('Service', 'Not executed')),
          f('Prepared', 'Matching pre-prepare plus two backup prepares establish the prepared condition at a replica.', c('Primary P', 'Proposal recorded'), c('Backups A, B, C', 'Prepare evidence', 'active'), c('Service', 'Still not executed')),
          f('Commit', 'A prepared replica receives three matching commits. Once earlier requests are executed, it executes X.', c('Primary P', 'Commit vote'), c('Backups A, B, C', 'Commit quorum: 3', 'good'), c('Service', 'Executes X at 10', 'good')),
        ] },
        { name: 'Primary stops', frames: [
          f('No proposal arrives', 'The primary is silent. A timeout motivates a view change; it does not erase the old log.', c('Primary P', 'Offline', 'warn'), c('Backups A, B, C', 'Waiting', 'warn'), c('Service', 'Earlier commits retained', 'good')),
          f('Transfer evidence', 'View-change messages carry checkpoints and prepared information to the next primary.', c('Primary P', 'Replaced', 'warn'), c('Backups A, B, C', 'Send view-change state', 'active'), c('Service', 'Earlier commits retained', 'good')),
          f('Validate the new view', 'The new primary constructs a new-view message. Backups validate its request selection before normal voting resumes.', c('Primary P', 'No longer primary'), c('Backups A, B, C', 'Validate new-view evidence', 'good'), c('Service', 'Resume from safe history', 'good')),
        ] },
      ],
    },
  },
  {
    id: 'raft', slug: 'raft', minutes: 12,
    dek: 'A strong leader makes replication easier to follow; election restrictions keep committed entries alive when that leader fails.',
    before: ['Paxos'], takeaway: 'A majority election alone is insufficient: voters must also check how up to date the candidate’s log is.',
    sections: [
      s('Make the leader’s job explicit', [
        'Raft divides replicated-log consensus into leader election, log replication, and safety. Time is organized into terms. A follower that stops hearing from a leader can become a candidate, increment its term, and ask for votes. Randomized election timeouts reduce repeated split elections.',
        'A leader appends client commands to its log and replicates them with AppendEntries. Followers check the preceding index and term so inconsistencies can be repaired. A crash is allowed; lying about log contents is outside Raft’s model.',
      ], 0),
      s('Replication is not yet commitment', [
        'For an entry from its current term, the leader can advance commitment after replication on a majority. Applying that entry also requires applying earlier committed entries in order. The special current-term rule matters: directly counting replicas is not sufficient to commit an old-term entry.',
        'On election, a voter grants its vote only if the candidate’s log is at least as up to date, comparing the last term first and then the last index. Each server votes at most once per term. These restrictions keep a candidate missing committed history from taking over.',
      ], 0),
      s('A five-server example', [
        'Let A lead term 4. It replicates X to B and C. That is three copies, including A, so current-term X can commit. When A crashes, a candidate with X can seek a majority; a candidate whose log lacks X cannot gather the needed votes from replicas with fresher logs.',
        'Switch to a minority partition. A and B can still communicate with each other, but two of five cannot commit a new command. C, D, and E may elect a new leader in a higher term. A client attached to the old leader must not be told its new command is durable.',
      ]),
      s('What recovery repairs', [
        'When an old leader rejoins, a higher term makes it step down. Its uncommitted suffix may conflict with the new leader’s log and be replaced. A correctly committed entry survives. The distinction between “present on one server” and “committed” is central to reading any replication diagram.',
        'The walkthrough holds membership fixed. Adding or removing servers requires its own safe membership-change rules; changing the denominator of a majority while requests are in flight is not just an administrative detail.',
      ]),
    ],
    tradeoffs: ['A leader handles replication traffic and can become a throughput bottleneck.', 'A minority partition loses write availability; Raft does not tolerate malicious replicas.'],
    papers: [{ title: 'In Search of an Understandable Consensus Algorithm (extended version)', authors: 'Diego Ongaro & John Ousterhout', year: '2014', href: 'https://raft.github.io/raft.pdf', note: 'Sections 5.2–5.4 and Figure 8 explain election and commitment restrictions' }],
    quizzes: [q('Can two servers out of five commit a new command?', 'No; they cannot reach a majority.', 'Yes, if one was the old leader.', 'Leadership does not remove the majority requirement.'), q('Why compare candidate logs during an election?', 'To prevent losing previously committed entries.', 'Only to choose the fastest server.', 'The election restriction connects log replication to safety across terms.')],
    walkthrough: {
      title: 'Replicate, then replace the leader', model: 'Five servers, fixed membership, crash faults only. X is a current-term entry; election and catch-up traffic are condensed into labeled steps.',
      scenarios: [
        { name: 'Leader crashes after commit', frames: [
          f('Append in term 4', 'A appends X locally; one copy does not establish commitment.', c('A', 'Leader: X', 'active'), c('B + C', 'No X yet'), c('D + E', 'No X yet')),
          f('Majority stores X', 'A, B, and C now store X from the current term. A can commit it.', c('A', 'X committed', 'good'), c('B + C', 'X stored', 'good'), c('D + E', 'Catching up')),
          f('A crashes', 'B has X and can seek a term-5 majority, subject to the log freshness check.', c('A', 'Offline', 'warn'), c('B + C', 'X retained; B seeks votes', 'active'), c('D + E', 'Can vote for fresh log', 'active')),
          f('A new leader preserves X', 'B becomes leader with a majority. It replicates the retained log to lagging followers.', c('A', 'Offline', 'warn'), c('B + C', 'B leads; X retained', 'good'), c('D + E', 'Receive X', 'good')),
        ] },
        { name: 'Leader in a minority', frames: [
          f('Partition splits 2 and 3', 'The old leader A can reach only B. The other three can communicate.', c('A', 'Old leader; isolated', 'warn'), c('B', 'With A', 'warn'), c('C + D + E', 'Connected majority', 'active')),
          f('An uncommitted command', 'A writes Y to A and B. Two copies cannot commit it.', c('A', 'Y uncommitted', 'warn'), c('B', 'Y uncommitted', 'warn'), c('C + D + E', 'Elect a higher-term leader', 'active')),
          f('Repair on rejoin', 'After reconnection, A steps down. Its uncommitted suffix can be overwritten by the new leader.', c('A', 'Follower; repairs log', 'active'), c('B', 'Repairs log', 'active'), c('C + D + E', 'Committed history wins', 'good')),
        ] },
      ],
    },
  },
];
