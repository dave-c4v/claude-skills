# Document types

Section skeletons for the documents V4C most often shares with clients. They are
starting shapes, not forms to fill: drop sections that have nothing to say, and never
pad one with general knowledge presented as engagement fact.

All types open with the cover and page-2 control block (document control, review and
release, contents) unless marked short.

## Solution / technical design

Close: decisions.

1. Summary: lead with the recommended design and the one decision it needs
2. Context and requirements: business drivers, constraints, non-functional requirements
3. Current state
4. Target architecture: medallion layers (bronze, silver, gold, labelled
   conventionally) with Unity Catalog governance unless the engagement specifies
   otherwise. Diagram as a PNG image block
5. Key design decisions: `table` of decision, options considered, choice, rationale
6. Security, governance and access
7. Delivery approach and milestones
8. RAID
9. Decisions required

Flag any recommendation that depends on the cloud provider (AWS, Azure, GCP), and on
the Claude surface (first-party API, Bedrock, Vertex, Foundry) where Claude is
involved. If the provider is not established for the account, ask.

## Discovery / assessment summary

Close: decisions or next steps.

1. Summary: what was found, what V4C recommends, as a lead paragraph plus a metric row
2. Scope and method: who was interviewed (roles), what was reviewed, over what period
3. Findings: one H2 per finding; each ends with its evidence source
4. Recommendations: numbered, each with effort and dependency
5. Proposed roadmap
6. Next steps or decisions

## Status report

Short: set `cover: false` for weekly; keep the cover for monthly or steering reports.

1. Summary: overall status in one sentence, then a metric row (for example milestones
   on track, open risks, decisions pending)
2. Progress since last report
3. Upcoming
4. RAID: changes only, full log linked
5. Decisions required (if any)
6. Next steps and owners

## Workshop / meeting notes

Short: `cover: false`.

1. Summary: outcomes, not a transcript
2. Attendees: names and roles only
3. Discussion: H2 per topic
4. Decisions made
5. Next steps and owners

## Runbook / handover guide

Close: next steps (support contacts by role, not personal details).

1. Purpose and audience
2. System overview
3. Procedures: one H2 per procedure, `numbered` steps, a `note` callout for
   preconditions
4. Monitoring and alerts
5. Troubleshooting: `table` of symptom, cause, action
6. Escalation path

Never include credentials, keys, connection strings or tokens. Reference the secret
store by name.

## AI system documentation (ISO 42001)

Required when V4C delivers an AI system to a client. Close: decisions (acceptance).

1. Summary
2. Intended use: users, tasks, decisions supported
3. Out-of-scope and prohibited uses
4. System description: models, data sources, integrations, provider and surface
5. Stated limitations and known failure modes
6. Human oversight: where a person reviews, approves or can override
7. Evaluation: what was tested, how, results with sources
8. Monitoring: signals, thresholds, owners, review cadence
9. Change management and version history
10. RAID
11. Acceptance decisions

Scope, licensing or appropriate-use questions go to the Claude program
owner before release.

## Proposal / statement of work

Commercial terms, pricing and legal language need the engagement lead and are out of
scope for generation without them. Structure only:

1. Summary: the outcome the client gets
2. Understanding of the need
3. Approach and phases
4. Deliverables: `table` of deliverable, description, acceptance criteria
5. Team: roles
6. Timeline
7. Assumptions and dependencies (`raid` with Assumption and Dependency rows)
8. Commercials: placeholder for the engagement lead
9. Next steps
