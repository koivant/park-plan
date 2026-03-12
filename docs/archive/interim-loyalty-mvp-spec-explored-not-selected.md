# Interim Loyalty MVP Spec

Last updated: 2026-03-04

## Goal

Ship a minimal stamp system before native ROLLER points loyalty is confirmed for production.

Rule:
1. `1 qualified visit = 1 stamp`
2. `6 stamps = 1 free day pass`

## Data flow

1. Guest purchase happens in ROLLER (online or POS).
2. Event data is received from ROLLER (webhook/API sync path to be confirmed).
3. Service matches guest by email or phone.
4. Service writes stamp history entry.
5. Rule engine validates and updates stamp balance.
6. On threshold, reward record is created.
7. Message with reward code/QR is sent.
8. Venue redeems reward and state changes to `redeemed`.
9. Daily reconciliation checks missing/failed events.

## Minimum data model

1. `guest_identity_map`
2. `stamp_history`
3. `stamp_balance`
4. `reward`
5. `audit_log`

## Recommended stack

1. Backend: TypeScript + Node.js (Fastify or NestJS).
2. Database: PostgreSQL.
3. Admin/support UI: Next.js (minimal internal view).
4. Background jobs: queue + scheduled reconciliation.
5. Messaging: email first, then add SMS/WhatsApp by market.

## Recommended cloud (AWS)

1. Compute: ECS Fargate (or Lambda for smaller volume).
2. Database: RDS PostgreSQL.
3. Async/eventing: SQS + EventBridge.
4. Ops: CloudWatch + Secrets Manager.

## Workload estimate (1 full stack developer, minimal MVP)

1. Low: 24 working days.
2. Likely: 32 working days.
3. High: 42 working days.
4. Calendar: about 5-8 weeks.

Most time-consuming tasks:
1. ROLLER event reliability and identity matching.
2. Anti-abuse and redemption edge cases.
3. Pilot fixes from real usage.
