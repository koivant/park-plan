# Tech Guide

## Architecture
- Standalone loyalty app on GCP.
- WordPress is external and links users into app.
- PWA scope is limited to the loyalty app.
- App serves browser account UI and backend APIs.

## Recommended Stack
- Runtime: Node.js + TypeScript.
- Hosting: Cloud Run.
- Database: Cloud SQL PostgreSQL.
- Cache: Memorystore Redis.
- Scheduling: Cloud Scheduler.
- Secrets: Secret Manager.

## Integration Pattern
- Webhook-first processing from ROLLER.
- No app-driven ROLLER REST call for voucher creation.
- No REST fallback path for failed webhooks in pilot.
- Failed webhook jobs are logged only in pilot (no automatic retries).
- ROLLER updates PATCH loyalty field on purchase, edit, and cancel events.
- PATCH creates one-time free-pass code when loyalty target is reached.
- PATCH syncs the one-time code to ROLLER for next-checkout validation.
- Code delivery to loyalty app is either PATCH automation webhook or PATCH custom-field read on `GET /account`.
- PATCH webhook ingestion as primary PATCH-to-app sync path (if supported by PATCH).
- PATCH REST pull as optional secondary reconciliation mode (not fallback).
- Local projection DB for fast account reads and history.
- Webhook queue absorbs bursts and isolates webhook intake from projection writes.
- Projection worker applies ordered loyalty updates and writes the read model.
- Children stamps proposition: add child stamps to parent only when child ticket is linked to that parent account.
- App-managed OTP for customer login.
- No customer login via ROLLER account.
- Cancellation is handled as an external event from ROLLER.
- Loyalty web/PWA has no cancellation action in pilot scope.
- Customer view updates are manual refresh (`GET /account`), not real-time push.

## Diagram References
- Customer journey and access paths: [`customer-journeys.mmd`](./diagrams/customer-journeys.mmd)
- Checkout-to-loyalty data updates and free-pass usage: [`rest-api-and-webhook-flow.mmd`](./diagrams/rest-api-and-webhook-flow.mmd)
- Discount code generation, sync, and redemption flow: [`discount-code-flow.mmd`](./diagrams/discount-code-flow.mmd)
- GCP infrastructure and service connections: [`infrastructure-and-dataflow.mmd`](./diagrams/infrastructure-and-dataflow.mmd)
