> Community spec for PostUI.org: the artifact, the PostUI connector and the AI Host. The static site's hosting and CI spec is [`/spec.md`](../spec.md). Diagrams from the original draft are described in text.

# PostUI.org Community Spec

Oct 6, 2026

## Overview

PostUI.org is a discussion-and-pilot community where operators and builders turn business workflows into AI-assistant-native apps, and it runs as a Claude artifact itself, so its own build is the first case study.

**Who it serves.** Two audiences on purpose: hands-on builders (developers, consultants, AI-fluent no-code people) and founders or executives who own the workflows being replaced. Every feature has to work for both.

**The core loop.** An operator posts a Need, a business workflow in plain words. Builders answer with Builds: a runnable artifact plus the spec that regenerates it. Members try, remix and pilot Builds on real work, and what survives a pilot is promoted to Canon, the patterns and case studies others cite.

**Why an artifact.** CRUD plus business rules plus a little AI is the class of app this community argues assistants can replace. A forum with roles, threads, search, moderation and a weekly digest is that kind of app, so building it this way is the proof.

**What carries over from the Discourse plan.** The goals stay: canonical case studies, AI participation from day one, post plus chat, and a low-friction public way in. Two of them, search-engine reach and reading before signing up, are at risk on an artifact; see Open questions and risks.

| Term | Meaning |
| --- | --- |
| Need | A business workflow someone wants an assistant-native app to handle, written to a template |
| Build | A runnable answer to a Need, stored with its spec and version history. Claude artifacts first; skills, plugins, custom GPTs, canvases and MCP servers also fit |
| Spec | The plain-language source of a Build: purpose, entities, rules, edge cases, acceptance tests. The artifact is its output |
| Remix | A new Build derived from another, with credit and lineage kept |
| Pilot | A time-boxed trial of a Build on a real workflow, with a baseline and a result |
| Canon | Curated patterns and case studies promoted from Pilots and strong threads |

## Goals and non-goals

v1 has to prove one loop: a business Need goes in, a working Build comes out, and the group improves it while AI does the host's busywork.

1. **Prove the loop.** Operators post Needs, builders answer with Builds, and members report what happened when they tried them.
2. **Produce Canon.** Turn the best pilots into patterns and case studies that others can cite.
3. **Make AI a participant.** Every Need gets an AI-structured brief and related Builds, and a weekly digest appears without founder effort.
4. **Run on founder time.** Community management fits inside 10 hours a week at 100 members.
5. **Be its own demo.** PostUI is built the way it tells others to build: spec first, artifact front end, assistant-native API.

Success measures, 60 days after launch (proposed, edit freely):

| Measure | Target |
| --- | --- |
| Invited members active in a given week | 30 of 50 |
| Needs posted | 20 |
| Needs with at least one Build within 7 days | 50% |
| Builds with at least one Try-it report | 15 |
| Builds remixed at least once | 8 |
| Canon entries published | 6 |
| Founder time on community admin | 10 hours a week or less |

Non-goals for v1: open self-signup (the pilot is invite-only, see Architecture), real-time chat, search-engine indexing of threads (Canon pages on postui.org carry that), a native mobile app or home-screen widget, payments or bounties, direct messages, and hosting members' production data (Builds run on synthetic data).

## Members and roles

PostUI has five roles, and the database and connector enforce all of them, so no rule depends on the artifact's own code.

| Role | Who | Can do |
| --- | --- | --- |
| Visitor | Anyone | Reads Canon and the landing page on postui.org and sends a join request |
| Member | Invited person | Posts Needs, Builds and Pilots; replies and reacts; files Try-it reports; runs AI helpers; edits own posts |
| Moderator | Trusted member | Hides, locks, pins and moves threads; resolves reports; edits tags; proposes Canon |
| Host | Leva, the founder | Everything above; approves invites, roles and Canon; configures the AI Host; holds the AI kill switch |
| AI Host | Claude, on a schedule | Tags, summarizes, drafts, flags and posts labeled content; cannot delete, suspend or change roles |

Members also choose a **hat**: Operator, Builder or both. Hats drive matching between Needs and people and carry no permissions. A profile holds a handle, hats, a one-line bio, links and a short note on what the member is building.

**Joining.** A visitor submits a join request: name, hat, one paragraph on the workflow they care about, and a LinkedIn or web link. The Host approves it, invites the person's email to the artifact and activates the membership. Invitation is manual in v1 because the artifact can only be shared by email invitation (see Architecture).

**Agents.** A member's assistant posts through the same connector as the member, labeled as posted by an assistant, under the member's rate limits and rules.

## Core community features

The table covers the pilot and what follows; each feature exists because this group needs it, and the Tie-in column marks where artifacts or AI carry it.

| Feature | What it does here | Tie-in | Phase |
| --- | --- | --- | --- |
| Spaces | Needs, Builds, Pilots, Canon, Thesis and Meta; six rooms so none sits empty | None | 1 |
| Structured posts | Need, Build and Pilot use templates; Question, Discussion and Announcement are free-form markdown | AI coach fills templates | 1 |
| Threads and replies | One level of nesting, code blocks, edit own, soft delete | None | 1 |
| Reactions with meaning | Useful, Works for me, Remixed, Thanks | None | 1 |
| Try-it reports | Outcome (works, partial, broke), environment and notes, attached to a Build version | Artifact | 1 |
| Tags and filters | Topic, platform, capability and industry tags; filters for unanswered, has Build and piloting | AI suggests tags | 1 |
| Search | Full-text over threads, Builds and Canon; related Needs and Builds appear while drafting | AI ranks related items | 1 |
| Profiles and directory | Handle, hats, what I'm building; filter by hat and tag | None | 1 |
| Notifications | In-app inbox for replies, mentions, 'your Build was tried or remixed' and moderator actions | None | 1 |
| Moderation basics | Report, hide, lock, pin, audit log, house rules, invite approval | AI triage flags | 1 |
| Pilot tracker | Baseline, result and decision for a Build tried on a real workflow | Artifact | 1 |
| Canon library | Curated patterns and case studies, mirrored to postui.org | AI drafts, Host approves | 1 |
| Weekly digest | Top Needs, new Builds, Try-it highlights and Canon candidates | AI drafts, Host approves | 1 |
| Remix lineage and spec diffs | Graph of who remixed whom; side-by-side spec changes | Artifact | 2 |
| Email notifications and async chat | Email for replies and digests; one Lounge channel that refreshes about every 30 seconds | None | 2 |
| Semantic search | Meaning-based search and similar Builds | AI | 2 |
| Open signup, reputation, events, assistant-native listings | Vetted self-signup; badges; AMAs; skills, plugins and MCP servers listed as Builds | None | 3 |

Real-time chat is deferred because the artifact refreshes connector data no faster than about every 30 seconds, and its live channel only lets organization members send. The pilot is a forum first; the Lounge is the nearest honest version of chat.

## Artifact-native features

Every Build is stored as four linked parts, because a shared artifact alone cannot be reproduced, trusted or improved.

| Part | What is stored | Why it matters |
| --- | --- | --- |
| Artifact | Single-file HTML or JSX source up to 200 KB, or a link to a published artifact, canvas, GPT, skill or MCP server | The runnable thing people try |
| Spec | Markdown: purpose, users, entities, rules, edge cases, permissions, acceptance tests | The source of truth; the artifact is its output, so fixes flow back to the spec |
| Data contract | Entities and fields plus ten rows of synthetic sample data | Lets others run the Build without real business data |
| Evidence | Try-it reports, Pilot results and an AI review card | Shows whether it works for people other than its author |

1. **Post a Build.** Paste source or a link, then paste or generate the spec; the AI reviewer lists where spec and source disagree. The author declares the platform and the Claude capabilities the Build needs (`db`, `sample`, `mcp`, `room`).
2. **Preview.** Pasted source runs in a sandboxed frame inside PostUI if spike S4 passes; otherwise the Build shows a code view, a small screenshot and an open-in-Claude link. Previews run without Claude capabilities, so a Build that needs `db`, `mcp` or `sample` shows a capability badge and runs only in its owner's Claude.
3. **Rebuild with my Claude.** One click assembles a prompt from the spec, source and constraints and copies it for the member's own Claude, which creates the member's copy as their own artifact. A remix starts from the spec and source, not from a copy of someone else's published page.
4. **Remix and lineage.** A remix pre-fills the parent's spec and source, keeps credit and links the two Builds; each Build shows what it remixed and how many remixes it has.
5. **Versions.** Versions are immutable. The AI drafts a changelog from the spec and source difference, and Try-it reports attach to a version.
6. **Connector and capability tags.** Filters such as needs no connector, needs Gmail and uses AI, because business buyers choose Builds by what they must connect.
7. **Pattern starters.** Spec templates for common business shapes: tracker, approval workflow, intake-to-pipeline, connector dashboard, scheduler and inventory. Each carries acceptance tests, and a Need can start from one.
8. **Export bundle.** A Build downloads as a Markdown bundle (spec, source, data contract) that Claude Code can pick up directly.

## AI-driven process

AI works at every stage of the loop, through helpers that run in a member's own Claude and an AI Host that runs on a schedule.

**Helpers** run inside the artifact on the viewer's own Claude usage (the `sample` capability), only on a click, and only after the viewer consents.

| Helper | Input | Output |
| --- | --- | --- |
| Need coach | A rough description, typed or dictated | A structured Need, up to three clarifying questions, suggested tags, and related Needs and Builds |
| Spec drafter | A posted Need | A draft Spec: entities, rules, edge cases, acceptance tests |
| Starter generator | A Spec | A first-pass single-file artifact to preview, copy or save |
| Build reviewer | Spec and source | A review card: spec-versus-source drift, data handling, accessibility basics, risky code, capabilities needed |
| Ask PostUI | A question | An answer that cites threads and Canon; not stored |
| Thread summary | A long thread | Decisions, open questions and next step, cached on the thread and labeled AI |

**The AI Host** is a scheduled Claude task that calls only the connector's `ai_*` tools. Hourly is the finest cadence the scheduler allows.

| Job | Cadence | What it does | Approval |
| --- | --- | --- | --- |
| Triage | Hourly | Tags new threads, flags duplicates and suspected spam for moderators, welcomes first posts | None; flags go to moderators |
| Matching and nudges | Daily | For Needs unanswered after 72 hours, posts a reply naming relevant Builds and members with the matching hat and tags | None |
| Summaries | Daily | Refreshes summaries on threads with 10 or more new posts | None |
| Digest | Weekly | Drafts the weekly digest | Host approves |
| Canon drafting | Weekly | Drafts case studies from finished Pilots, using the Pilot's own numbers | Host approves |

Six rules govern all of it:

1. **Humans decide, AI proposes.** The AI Host never deletes, suspends or changes roles; moderation by AI stops at flagging.
2. **Label everything.** AI-written content carries an AI badge, the job, the model tier and the date.
3. **Content is data, not instructions.** Posts, specs, source and comments are untrusted input; AI jobs quote them as data, use a fixed tool list and ignore instructions found inside.
4. **Audit and undo.** Every AI action is a row in `ai_actions`; moderators can revert applied actions; one setting switches the AI Host off.
5. **Public content only.** AI jobs read what members can see, never emails or private fields.
6. **Spend on purpose.** Helpers run on a click; the AI Host makes one call per job per run and skips runs when nothing changed.

## Architecture

An artifact cannot host an open community by itself, so PostUI uses the artifact as the front end and sends every write through one assistant-native API, the PostUI connector.

Two platform facts force this. Outside viewers never write to an artifact's built-in database, and the page cannot call outside servers, Supabase included. The table lists what each capability gives PostUI (source: artifact runtime contract 0.2.71 and the Artifact page contract); spikes S1 to S4 confirm the parts that need a second account to test.

| Capability | Gives PostUI | Limit that shapes the design |
| --- | --- | --- |
| Network (`fetch`, WebSocket) | Nothing | Blocked outside script CDNs; the page cannot reach Supabase |
| `db` | Shared documents with live updates | Only the owner and organization members write; outside viewers read only when signed in; 256 KiB per document, 25,000 per artifact |
| `mcp` | Calls to the viewer's own connectors, including PostUI | Runs with the viewer's credentials; bars public-link sharing; refreshes about every 30 seconds at best |
| `sample` | Claude inside the page, on the viewer's usage | Viewer consents on the first call; 256 KiB of input; answers cached 5 minutes |
| `room` | Live presence and events | Reaches organization members and invited guests; sending needs Contributor access |
| `user` | Who is viewing, as an opaque id | Outsiders appear only as guests |
| `downloads` | Save a generated file | Viewer confirms each save |
| `assets` | File storage | Organization-internal; blocks public sharing |
| Deep links | `#token` permalinks | Only plain `#anchor` tokens reach the page, never query strings |

**Decision D1: the write path is a PostUI connector.** It is a remote MCP server running as a Supabase Edge Function. Members add it to their Claude once; the artifact reaches it through `mcp`; members' assistants, agents and the AI Host call it directly. Business rules live in Postgres functions, so every door shares them. Reads refresh about every 30 seconds, and permalinks use `#t-<id>`.

Members, their assistants and the AI Host reach Postgres only through the connector; Claude Code and Supabase MCP touch it at build time.

- **PostUI artifact.** Single-file HTML that declares `mcp` (PostUI tools only), `sample` and `downloads`. It is shared by email invitation, since `mcp` bars the public link. It renders the feed, threads, Builds, Pilots and Canon, runs the AI helpers, and shows a first-run panel that explains how to add the connector.
- **PostUI connector.** OAuth 2.1 sign-in through Supabase Auth. Tools: `whoami`, `feed`, `search`, `get_thread`, `post_need`, `post_build`, `post_pilot`, `reply`, `react`, `try_report` and `report`, plus `mod_*` for moderators and `ai_*` for the AI Host.
- **Supabase.** Postgres with row-level security as the system of record, plus Auth, Edge Functions and pg_cron.
- **AI Host.** Scheduled Claude tasks that call the connector's `ai_*` tools; the prompts are versioned in the repo.
- **postui.org.** The existing static site: landing page, join-request form and Canon pages exported by the AI Host. It is the only part search engines see.
- **Claude Code with Supabase MCP.** Build time only: migrations, RLS, advisors and deployments. At runtime an artifact's MCP calls use each viewer's own connectors, and members have no access to the Supabase project.

If a spike fails, the fallback follows from which one:

| If this fails | Then |
| --- | --- |
| S1: invited outside guests cannot use `sample` or `mcp` in the artifact | The artifact becomes a read-only snapshot that the AI Host writes into `db`; posting moves to web forms on postui.org that call the same Postgres functions |
| S3: members cannot add or authorize the connector | The same fallback: web forms for writes, the artifact for reading and AI |
| S1 and S3 both fail | Today's artifact runtime cannot host the writes; run the community on Discourse as first planned and ship the artifact as its AI companion |

## Data model

Postgres holds the whole community, every table has row-level security on, and the connector calls Postgres functions, never raw tables.

| Table | Key columns | Notes |
| --- | --- | --- |
| members | id (auth user id), handle, display_name, hats, bio, role, status, invited_by, joined_at | role: member, moderator, host, ai_host |
| join_requests | id, name, email, hat, workflow, link, status, decided_by | Insert only through a rate-limited function |
| spaces | slug, name, kind, position | needs, builds, pilots, canon, thesis, meta |
| threads | id, space, kind, author_id, title, body_md, status, pinned, locked, hidden, last_activity_at, ai_summary, ai_summary_at | kind: need, build, pilot, question, discussion, announcement |
| needs | thread_id, problem, who_for, current_workflow, entities, rules_md, integrations, constraints_md, success_metric | Template fields for Need threads |
| posts | id, thread_id, author_id, parent_id, body_md, is_solution, hidden, by_kind, created_at, edited_at | parent_id one level deep; by_kind: human, assistant, ai_host |
| builds | id, thread_id, need_id, owner_id, title, summary, platform, capabilities, license, remix_of, status | status: draft, tried, stable, retired |
| build_versions | id, build_id, version, spec_md, source_kind, source_text, source_url, data_contract, changelog_md, scan, ai_review | Immutable; source_text up to 200 KB |
| tries | id, build_id, version, member_id, outcome, env, notes_md | One per member per version |
| pilots | id, thread_id, build_id, operator_id, workflow, baseline, result, decision, started_at, ended_at | baseline and result hold metric, value and unit |
| canon | id, slug, kind, title, body_md, source_thread_id, source_pilot_id, status, approved_by, published_at | status: candidate, approved, published |
| reactions | member_id, target_type, target_id, kind | Primary key over all four columns |
| tags, thread_tags, build_tags | slug, name, kind | kind: topic, platform, capability, industry |
| notifications | id, member_id, kind, ref, read_at |  |
| reports | id, reporter_id, target_type, target_id, reason, status, ai_triage, handled_by |  |
| mod_log | id, actor_id, actor_kind, action, target_type, target_id, reason | Append only |
| ai_actions | id, job, run_by, target_type, target_id, input_hash, output, status, applied_by | Append only; status: proposed, applied, reverted |
| settings | key, value | ai_enabled, rate limits, house-rules version |

The schema enforces these rules, so no client has to:

- Members read every row that is not hidden; moderators and the Host also read hidden rows.
- Members insert only as themselves and soft-hide only their own content; hard deletes are Host-only.
- `build_versions`, `mod_log` and `ai_actions` accept inserts and never updates or deletes.
- Accounts under seven days old are limited to five posts a day, and their first three posts with links wait for a moderator.
- Roles change only through a Host-only function.
- The ai_host role can insert posts with `by_kind = ai_host`, insert `ai_actions` and `reports`, and update thread summaries and tags; nothing else.
- Counters such as reply and remix counts come from triggers, and search uses generated tsvector columns with GIN indexes on threads, posts, builds and canon.

## Moderation and trust

The pilot stays small and invite-only, and trust comes from vetted entry, tight rate limits, labeled AI and sandboxed code.

**House rules.** Five rules, shown at join and linked from every composer:

1. Synthetic data only. Never post customer, employee or confidential data.
2. Say when AI wrote it.
3. Builds ship with a spec and a license.
4. No unsolicited promotion; consulting offers go in replies to Needs that ask for help.
5. Be specific and be kind.

**Entry and spam.** The Host vets join requests, invitations are single-use, and the schema's rate limits apply by account age. Reports go to a queue, and AI triage adds a signal that humans act on.

**Untrusted code.** Build source is data until someone chooses to run it. A static scan on submit flags network calls, `eval` and `Function`, external script hosts, cookie and storage access, messages to the parent frame, and obfuscation. Previews run in a frame with `sandbox="allow-scripts"` only: no same-origin access, forms, popups or navigation. Previews have no Claude capabilities, the page ignores messages from them, and Builds that declare `mcp` or `files` are never previewed. Before a member runs a Build in their own Claude, PostUI shows the capabilities it declares, especially `mcp`, which acts with the member's connector credentials.

**Prompt injection.** Posts and source can carry instructions aimed at AI. Every AI job treats content as quoted data, and the AI Host's tools cannot delete or change roles, so a successful injection can at worst produce a bad tag, summary or flag, all of which are logged and revertible.

**Privacy.** Email addresses live only in Supabase Auth and join requests and are never shown. Account export and deletion ship in Phase 2.

**Licensing.** Each Build declares a license. Proposed default: CC BY 4.0 for specs and MIT for source, editable per Build.

**Transparency.** Every moderator action is logged with a reason, and the author sees why a post was hidden.

## Phasing

Phase 0 settles the platform questions and Phase 1 is the invite-only pilot, which together are what the Build brief covers; Phases 2 and 3 wait for evidence.

_Each phase opens only when the gate before it is passed._

| Phase | Purpose | What ships | Gate that opens the next phase |
| --- | --- | --- | --- |
| 0 · Spikes | Prove the platform | S1 guest use; S2 public link; S3 OAuth connector; S4 sandboxed frame. Needs a second claude.ai account. | Spikes pass, or a fallback is chosen |
| 1 · Pilot | Prove the loop | Invited cohort of 50; spaces and threads; structured posts; Try-it reports; search, tags, inbox; moderation basics; AI helpers and AI Host; Canon on postui.org | The 60-day success measures are met |
| 2 · Depth | Deepen the loop | Cohort grows to 100; remix lineage; spec diffs; semantic search; email notifications; async Lounge chat; export and deletion | 100 members and admin inside 10 hours a week |
| 3 · Open | Open the doors | Vetted self-signup; reputation badges; events and AMAs; assistant-native listings (skills, plugins, MCP servers) | None defined yet |

Gate criteria are proposals drawn from Goals and the spikes; a failed gate means revising the phase rather than skipping ahead, and no phase carries a date.

## Open questions and risks

Four platform spikes decide the architecture, so they run before any feature work. All four need a second claude.ai account that sits outside the owner's organization.

| Spike | Question | Test | If it fails |
| --- | --- | --- | --- |
| S1 | Can an invited outside guest open the artifact, run `sample` and call a connector through `mcp`? | Publish a test page, invite the second account as Viewer, run each call | Read-only artifact plus web forms (see Architecture) |
| S2 | Does declaring `mcp` bar the public link, and does email invitation work for people outside any Team plan? | Share the test page both ways; open it as the second account and as a signed-out visitor | Limit the pilot to people the Host can invite one by one, or drop `mcp` |
| S3 | Can a member add a custom remote MCP connector with OAuth, hosted on a Supabase Edge Function, and does the artifact call it? Which Claude plans allow custom connectors? | Deploy a hello-world MCP server with one read tool and one write tool; add it to the second account | Web forms for writes |
| S4 | Does the artifact's security policy let the page run member source in a sandboxed `srcdoc` frame? | Render a sample Build and read the console | Code view, screenshot and open-in-Claude link |

Decisions for Leva:

1. Is an invite-only pilot acceptable, given that `mcp` bars the public link?
2. Is posting through web forms acceptable as the fallback, even though it leaves the artifact?
3. Where is postui.org hosted, and how should exported Canon pages reach it?
4. Who else moderates in the first 60 days?
5. Are CC BY 4.0 for specs and MIT for source the right license defaults?
6. Does nbino's Claude plan include member seats? If so, the core team can use `db` and `room` natively for internal tools.
7. What does the AI Host go by in the community?

Risks:

- **Platform drift.** The artifact runtime is versioned (0.2.71 today); pin the contract and upgrade on purpose.
- **Audience filter.** Custom connectors may need a paid Claude plan; confirm in S3 and say so on the join form.
- **Reach.** Artifacts are not indexable, so Canon on postui.org is the only public surface.
- **Cost.** AI helpers spend each member's Claude usage and the AI Host spends the Host's; batch calls and skip empty runs.
- **Abuse.** Member-submitted code and AI reading member text are the two sharp edges; see Moderation and trust.
- **Founder time.** The 10-hour budget holds only if the AI Host jobs work, so measure it weekly.

## Build brief for Claude Code

Build in this order, and stop at any step whose check fails.

1. **Repo.** One repo with `/supabase` (migrations and functions), `/artifact` (single-file HTML), `/site` (the existing postui.org source), `/ai-host` (scheduled-task prompts) and `/docs/spec.md` (this spec). Check: the layout is committed.
2. **Spikes S1 to S4.** Record pass or fail with notes in `/docs/spikes.md`. Check: stop and report if S1 or S3 fails, because the architecture changes.
3. **Schema and security.** Create the tables from Data model through Supabase MCP migrations, turn on RLS everywhere and write pgTAP tests for each role. Check: all role tests pass and the security advisor reports nothing.
4. **Postgres functions.** One function per write, with role checks, rate limits and the append-only rules. Check: one test per rule.
5. **Connector.** Edge Function MCP server with OAuth through Supabase Auth and typed tool schemas. Check: a second Claude account adds it and calls `feed` and `post_need`.
6. **Artifact v1.** One HTML file with theme tokens that match postui.org (dark terminal look, Fira Code, purple accent) plus a light mode, a pinned runtime contract, and capabilities limited to `mcp` (PostUI tools), `sample` and `downloads`. Views: Feed, Thread, Needs, Builds, Pilots, Canon, Profile, Inbox and Moderation. Routes use `#t-<id>`. Include a first-run panel for a missing connector and designed empty, loading and error states. Render member content as text or sanitized markdown, never raw HTML. Check: one functional pass as the guest account.
7. **AI helpers.** One prompt file and one JSON schema per helper; use `modelTier: quick` for tagging and classification; hide the feature when `sample` is null. Check: each helper returns valid output on three sample inputs.
8. **AI Host.** One scheduled task per job, each limited to its `ai_*` tools. Start in dry-run mode, where actions land in `ai_actions` as proposed. Check: the Host reviews a week of proposals before applying is switched on.
9. **Site.** Join-request form, Canon export script and landing copy. Check: a join request reaches the Host's queue and Canon pages build.
10. **Seed and launch.** The Host posts five Needs and three Builds, invites ten members, and grows to 50 after two weeks. Check: the success measures under Goals.

Conventions:

- No secrets in the artifact; only the connector name and public configuration.
- The `service_role` key lives only in Edge Function secrets.
- Images inside the artifact are data URIs, because the page blocks external images.
- Every migration is reversible and every AI action is logged.
- Keep a `CHANGELOG.md` and bump the artifact version on every publish.
