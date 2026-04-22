# Loyalty App Integration Plan (Standalone GCP Service)

## Scope
- Build a standalone app that serves account UI and backend APIs.
- Features: account info, booking/waiver visibility, loyalty status.
- WordPress only links users to this app.
- PWA scope is only the loyalty app.
- No self-service profile editing in app scope.

## Confirmed Decisions
- Use ROLLER + PATCH native integration for transaction and contact sync ([PATCH setup guide](https://help.patchretention.com/how-to-setup-the-patch-roller-integration), [ROLLER partner page](https://www.roller.software/integrations/partner/patch-retention)).
- Loyalty in PATCH is handled as contact custom field summary (current points/stamps state) ([PATCH mapped fields](https://help.patchretention.com/what-data-fields-are-mapped-from-roller-to-patch), [contact fields](https://help.patchretention.com/account-settings-fields-contact-level), [PATCH contacts API](https://api.patchretention.com/v2/contacts)).
- Loyalty summary field is configured as an integer custom field ([contact fields](https://help.patchretention.com/account-settings-fields-contact-level)).
- PATCH loyalty summary does not include full history by default.
- Use ROLLER webhooks as primary ingestion path.
- Keep ROLLER REST usage minimal because API calls have cost.
- Maintain local database for account projection and history.
- Use app-managed OTP login. Park customers do not use ROLLER credentials.

## Architecture
- Runtime: `Node.js + TypeScript`.
- Hosting: `Cloud Run`.
- Database: `Cloud SQL PostgreSQL`.
- Cache: `Memorystore Redis`.
- Secrets: `Secret Manager`.
- Scheduler: `Cloud Scheduler` for reconciliation.

## Data Model
- ROLLER: account, bookings, waivers, visit events.
- PATCH: loyalty summary custom fields and reward state on contacts.
- Local DB: identity map, event log, loyalty history, merged account projection, auth/session.

## Processing Model
- Event-first: ingest ROLLER webhooks, store events, update projection.
- Read path: serve account view from projection/cache (read-only UI).
- PATCH refresh: fetch contact loyalty summary by email/contact ref when projection is stale or on sync trigger.
- Optional REST backfill: use ROLLER REST only for repair, replay, or missing details ([ROLLER Data API](https://mysupport.roller.software/hc/en-us/articles/360001653475-Data-API), [ROLLER GraphQL](https://docs.roller.app/graphql)).

## Research Answers
- Children stamps and parent linkage:
  - ROLLER models minors as separate signed waivers/guest records and provides `ParentSignedWaiverId`.
  - PATCH sync includes guardian/minor relationship data.
  - Recommended: do not assume automatic child-to-parent stamp merge. Implement explicit roll-up rules in app logic.
- PATCH vs ROLLER data movement:
  - Operationally, ROLLER data syncs into PATCH in the native integration.
  - App should treat PATCH as source for loyalty summary and voucher code, with manual refresh in customer view.
- Discount code for 100% park access:
  - Preferred: PATCH creates a one-time free-pass code when loyalty reaches threshold.
  - PATCH syncs the one-time code to ROLLER for checkout validation.
  - Loyalty app receives the code from PATCH via automation webhook or PATCH custom field read.
  - Store code metadata and state in local DB; validate/redeem in ROLLER checkout.
  - Alternative: if single-use code lifecycle is complex, use a fixed reward product + server-side entitlement check.
- GDPR concerns for non-GDPR countries:
  - Main issue is transfer/legal basis, not country label alone.
  - If processing targets EU establishments or EU data subjects, GDPR obligations apply ([GDPR text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679), [EDPB territorial scope guidance](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32018-territorial-scope-gdpr-article-3-version_nb)).
  - For transfers outside EEA, apply Chapter V controls (adequacy, SCCs (Standard Contractual Clauses), or derogations) and keep transfer records ([GDPR text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)).
  - Legal review is required before production.
- OTP handling:
  - Use short-lived, single-use OTP, strict rate limits, attempt caps, and session timeouts ([NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)).
  - Email OTP is acceptable for pilot convenience but lower assurance than TOTP/WebAuthn.
- SQL or NoSQL:
  - Use SQL (PostgreSQL) as primary store for idempotent event writes, joins, auditability, and transactional consistency.
  - Add NoSQL only if later needed for specific high-volume read patterns.

## Remaining Unknowns
- Final PATCH field keys and account-level naming.
- Final child-to-parent stamp roll-up policy per park.
- Final discount expiry and reuse policy per market.

## Delivery Steps
1. Implement OTP login/session and identity map.
2. Implement ROLLER webhook ingestion and idempotent event store.
3. Build projection pipeline and account UI read model.
4. Integrate PATCH contact fetch for loyalty summary custom field.
5. Add cache and scheduler-based reconciliation.
6. Pilot validation in Glasgow: login, bookings, waivers, loyalty status, discount visibility.
