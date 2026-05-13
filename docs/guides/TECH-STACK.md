# TECH-STACK

## Runtime
The app is a Node.js and TypeScript service using Express 5. Source files use ECMAScript modules. Runtime configuration is read from environment variables in `config.ts`.

## API Layer
Express registers three route groups:

- Core routes: health, docs, join form, OTP, and account projection.
- PATCH webhooks: contact updates and reward-code updates.
- ROLLER webhooks: booking and signed-waiver updates.

OpenAPI output is generated from Zod schemas and served at `/openapi/openapi.json`. Swagger UI is served at `/docs`.

## Validation
Zod validates request bodies, query parameters, webhook envelopes, and account response shape. The schemas are the API contract source of truth for documented payload fields.

## Storage
PostgreSQL is the implemented database. The schema defines:

- `customers`: normalized contact identity, PATCH and ROLLER ids, home park, loyalty state, pending status, and waiver state.
- `otp_codes`: hashed one-time codes, expiry, and consumption state.
- `webhook_events`: raw provider payloads with optional provider event metadata.
- `bookings`: normalized ROLLER booking projection.
- `discount_codes`: PATCH-issued reward codes and local used-state fields.

The app has some runtime schema-repair code for older databases, but the SQL schema is the intended structure.

## Local Environment
Docker Compose runs:

- Postgres 16.
- API container on port `3000`.
- Scheduler container.

The app can also run locally with `npm run dev` from the app folder. Tests use Vitest and Supertest.

## Provider Integrations
ROLLER integration uses OAuth client credentials for REST API calls. MVP ROLLER usage is webhook-first: booking data enters through webhooks, and targeted guest-detail lookup fills missing customer contact fields when needed. Webhook management tooling is implemented for setup. The local rate limiter spaces ROLLER API calls to one call per second, which stays within ROLLER's published 3600 calls per hour per OAuth token limit.

PATCH integration is the stamp-state path for MVP. ROLLER syncs contact and booking data into PATCH through the native ROLLER/PATCH integration, PATCH calculates or stores loyalty state, and PATCH webhooks send the result to the loyalty app. PATCH webhook URLs include a dynamic location segment, such as `/webhooks/patch/glasgow/contact-updated`, so the app can determine the park and set the customer's current home park. The app also has a minimal PATCH REST client for contact listing and backfill checks. The PATCH client sends `Authorization: Bearer <apiKey>` and `X-Account-Id`.

## MVP Data Flow
The core data flow is:

1. ROLLER booking webhook writes booking and customer projection to PostgreSQL.
2. ROLLER/PATCH native sync updates PATCH contact and stamp state.
3. PATCH webhook writes loyalty points, target, location-derived home park, and reward code data to PostgreSQL.
4. Web/PWA reads `GET /account` and shows the local projection.

The app should avoid live provider reads during normal customer page load. Use provider reads only for targeted backfill or validation.

## Deployment Target
The planned deployment remains GCP:

- Cloud Run for API and any frontend service.
- Cloud SQL PostgreSQL for persistence.
- Secret Manager for provider credentials.
- Cloud Scheduler or equivalent for reconciliation jobs.
- Cloud Logging for application logs.

Redis/Memorystore is not implemented in the current code. Treat it as optional future infrastructure, not current state.

## MVP Priority
Prioritize the smallest stack needed to verify bookings-to-stamps-to-customer-view:

- Express API.
- PostgreSQL projection.
- ROLLER webhooks and targeted guest lookup.
- PATCH webhooks and minimal contact lookup.
- A thin web/PWA account view over `GET /account`.

Delay caching, complex schedulers, offer targeting, and full authentication hardening until the MVP flow works end to end.

## External Verification Sources
- ROLLER Data API is for periodic data export and is not suitable for real-time single-record account reads: [ROLLER Data API](https://mysupport.roller.software/hc/en-us/articles/360001653475-Data-API).
- ROLLER REST API rate limit is published as 3600 calls per hour per OAuth token: [ROLLER API terms](https://www.roller.software/api-terms-of-service).
- PATCH documents that ROLLER contact data, orders/bookings, guardian/minor relationship data, and cancellation effects sync into PATCH: [PATCH ROLLER mapped data](https://help.patchretention.com/what-data-fields-are-mapped-from-roller-to-patch).
- PATCH ROLLER setup requires a ROLLER client id and client secret from the ROLLER API key setup flow: [PATCH ROLLER setup](https://help.patchretention.com/how-to-setup-the-patch-roller-integration).
- PATCH contact fields include field keys and account association: [PATCH contact fields](https://help.patchretention.com/account-settings-fields-contact-level).
