# Data Handling Overview

## Service Boundary
- Standalone loyalty app on GCP.
- WordPress is external and only links users into the app.
- PWA scope is only the loyalty app, not the full WordPress site.

## Source of Truth
- ROLLER: customer profile references, bookings, waivers, visit events.
- PATCH: loyalty summary via contact custom fields (integer summary field).
- Local DB: required system of record for app projection and history.

## Key Constraint
- PATCH gives current loyalty summary state.
- Full loyalty history is built from stored ROLLER webhook events in local DB.

## Local Storage
- Keep minimal PII.
- Persist provider events for replay and audit.
- Store merged account projection for fast reads.

## Suggested PostgreSQL Tables
- `identity_map`
  - `email_normalized`, `roller_customer_ref`, `patch_contact_ref`, `updated_at`
- `provider_events`
  - `provider`, `event_type`, `provider_event_id`, `payload_json`, `status`, `processed_at`
- `loyalty_event_history`
  - `email_normalized`, `event_ref`, `event_type`, `occurred_at`, `source`
- `account_projection`
  - `email_normalized`, `profile_json`, `bookings_json`, `waivers_json`, `loyalty_json`, `updated_at`
- `auth_session`
  - `session_id`, `email_normalized`, `expires_at`, `created_at`

## Read Path
1. User opens account page.
2. App validates session.
3. App reads cache, then projection.
4. If projection stale, app refreshes from PATCH contact loyalty summary and required provider details.
5. App returns merged payload (view-only; no self-edit endpoints).

## Update Path
1. ROLLER webhook arrives.
2. App validates auth/signature and idempotency.
3. App writes event and updates projection.
4. App records loyalty history event.
5. App invalidates cache.

## Scheduling
- Use reconciliation jobs to repair missed webhook processing.
- Keep schedule light; event flow remains primary.

## Caching
- Cache merged account payload with short TTL.
- Key: `account:{email_normalized}`.
- Invalidate on webhook-driven projection updates.

## Privacy
- Minimize retained PII.
- Encrypt sensitive values at rest.
- Apply retention windows for raw event payloads.
- Store legal basis and transfer mechanism metadata for cross-border records.
