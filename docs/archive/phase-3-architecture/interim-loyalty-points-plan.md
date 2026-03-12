# Interim Loyalty Points Plan (Before Native ROLLER Loyalty)

Last updated: 2026-03-04

## Goal

Launch a temporary points/stamp system now, then replace it later with native ROLLER loyalty.

Initial rule:

1. One qualified visit = one stamp.
2. Six stamps = one free day pass reward.

## Scope

## In scope

1. Point logging from ROLLER events.
2. Reward creation when a guest reaches 6 stamps.
3. POS-friendly redemption flow (scan/search + mark used).
4. Basic reporting for issued/redeemed rewards.

## Out of scope

1. Full loyalty app.
2. Tiered points rules and complex gamification.
3. Long-term BI modeling.

## Recommended technical approach

1. Keep ROLLER as source of transaction/visit truth.
2. Build a small temporary points service:
   - webhook receiver
   - points history table
   - reward table
   - simple support view for admins
3. Run daily reconciliation job so missed events can be corrected.
4. Keep data model simple so migration to native loyalty is easier.

## Delivery plan

## Phase 0: Design (3-5 person-days)

1. Confirm what events count as a stamp.
2. Define anti-abuse rules (for example max 1 stamp/day/guest).
3. Define reward redemption process at POS.

Output:

1. Signed rules document.
2. Event mapping and data contract.

## Phase 1: Core build (10-15 person-days)

1. Build points database tables.
2. Build event ingestion endpoint + validation.
3. Build stamp counter logic.
4. Build reward issuance logic at 6 stamps.

Output:

1. Working points history.
2. Reward records generated automatically.

## Phase 2: Integration + operations (8-12 person-days)

1. Connect event feed from ROLLER.
2. Add daily reconciliation job.
3. Add simple support/admin screen.
4. Add guest notification flow (email/SMS/WhatsApp where available).

Output:

1. End-to-end flow from visit to reward message.
2. Support playbook for manual corrections.

## Phase 3: Pilot + hardening (7-10 person-days)

1. Pilot in 1 market / 1-2 parks.
2. Validate reward abuse controls and edge cases.
3. Tune rules and fix defects.
4. Prepare migration plan to native loyalty.

Output:

1. Pilot report.
2. Go/no-go rollout decision.

## Workload estimate

## Person-days

1. Minimum: 28
2. Likely: 37
3. High: 49

## Calendar estimate

1. Minimum: 5 weeks
2. Likely: 6-8 weeks
3. High: 8-10 weeks

Assumptions:

1. Small team with part-time product/QA support.
2. No new mobile app build.

## Minimal MVP estimate (1 full stack developer)

Assumption: one developer handles backend, small admin UI, integration, and QA support.

## Task-level estimate (working days)

1. Rules and flow lock: 2
2. Data model and API endpoints: 3
3. ROLLER event sync and identity matching: 6-8
4. Stamp and reward logic: 4-5
5. Redemption flow and support UI: 5-6
6. Notifications (email first, phone/WhatsApp later): 3-5
7. Reconciliation job, monitoring, and logs: 3-4
8. Pilot QA and fixes: 5-7

## Total for one developer

1. Low: 24 working days
2. Likely: 32 working days
3. High: 42 working days
4. Calendar estimate: about 5-8 weeks

## Most time-consuming tasks

1. Reliable event integration with ROLLER and guest identity matching.
2. Redemption and anti-abuse rules (duplicate stamps, double redemption, refunds/cancellations).
3. Pilot QA and edge-case fixes.

## Recommended technology stack (minimal)

1. Backend: TypeScript + Node.js (Fastify or NestJS).
2. Database: PostgreSQL.
3. Admin/support UI: simple Next.js page.
4. Background jobs: queue + scheduled reconciliation job.
5. Messaging: start with email; add WhatsApp/SMS by market need.

## Recommended cloud service

1. AWS.
2. Minimal setup: ECS Fargate (or Lambda), RDS PostgreSQL, SQS, EventBridge, CloudWatch, Secrets Manager.

## Suggested team

1. 1 backend engineer (primary)
2. 1 integration engineer (part-time)
3. 1 QA engineer (part-time)
4. 1 product owner (part-time)
5. 1 operations/training owner (part-time)

## Main risks

1. Native ROLLER loyalty arrives while interim build is still expanding.
2. Incomplete event coverage causes missing stamps.
3. Fraud/abuse if identity and redemption rules are too loose.

## Risk controls

1. Keep interim scope small and disposable.
2. Reconcile daily and monitor failed events.
3. Use strict reward redemption states (`issued`, `redeemed`, `void`).
4. Re-evaluate roadmap fit when March 2026 loyalty details are published.
