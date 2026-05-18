# TODO

## Goal
Validate the minimal loyalty app flow end to end: gather ROLLER booking data, create or sync loyalty customer accounts, receive PATCH stamp state, and show bookings, tickets, and loyalty status to customers in the web/PWA view.

## MVP Done
- ROLLER booking webhook ingestion exists at `/webhooks/roller/booking`.
- ROLLER booking webhook ingestion also accepts `/webhooks/roller/:parkId/booking`; the path value is used as park fallback when payload park identity is missing.
- ROLLER booking ingestion stores raw webhook payloads and provider event metadata.
- ROLLER booking ingestion normalizes booking reference, ROLLER customer id, venue, source, channel, dates, ticket quantity, status, and event metadata into `bookings`.
- Booking events can create or sync customer records by ROLLER customer id, normalized email, or normalized phone.
- Booking ingestion can fetch ROLLER guest detail when a booking has `customerId` but no email or phone and ROLLER credentials are configured.
- Booking updates can keep an existing customer link when a follow-up webhook lacks contact details.
- Booking cancellation and deletion events update booking status.
- PATCH `contact-updated` webhook ingestion exists at `/webhooks/patch/contact-updated`.
- PATCH `contact-updated` updates customer identity, PATCH contact id, ROLLER customer id, loyalty points, loyalty target, and home park fields when provided.
- PATCH `reward-code` webhook ingestion exists at `/webhooks/patch/reward-code`.
- PATCH `reward-code` stores one or more active discount codes for the matched email.
- Demo join form exists at `/join`.
- Demo join submission creates a pending customer and prevents duplicate signup by email or phone.
- Magic-link request and consume endpoints exist for customer login.
- Local `/login` and `/account-view` pages exist for Docker magic-link testing.
- Development magic-link requests log a mock email with the login link.
- Local logout clears the session and redirects to a mock home park front page.
- `GET /account` returns the current customer projection by email.
- Account projection includes profile, loyalty points, loyalty target, home park, visited parks, bookings, waiver status, and discount codes.
- PostgreSQL schema exists for customers, magic-link tokens, webhook events, bookings, and discount codes.
- OpenAPI JSON and Swagger UI are generated from route schemas.

## MVP Next
- Validate the full happy path in sandbox: ROLLER booking -> PATCH loyalty/stamp update -> loyalty app account projection -> web/PWA account view.
- Confirm the exact ROLLER booking payload fields available in real sandbox events for customer id, venue/park, tickets, booking dates, and status.
- Confirm PATCH automation sends the fields the app currently accepts: email or phone, ROLLER id, loyalty points, loyalty target, PATCH contact id, and home park.
- Accept location-scoped PATCH webhook paths, for example `/webhooks/patch/glasgow/contact-updated`.
- Apply the PATCH webhook location segment as the customer's current home park when processing PATCH updates.
- Define the minimal enrollment rule: a park visitor becomes a loyalty customer when they submit `/join` or when a ROLLER/PATCH event contains enough identity data to create or match a customer.
- Add a simple customer account backfill path using existing PATCH contact lookup and targeted ROLLER guest/detail reads where needed.
- Use the dynamic PATCH webhook location segment as the MVP park sync key for PATCH-originated updates. Current booking webhook path also supports `parkId`; PATCH credentials are still global.
- Build or connect the customer-facing web/PWA account view to `GET /account`.
- Ensure the view clearly shows stamp count, target, bookings/tickets, home park, visited parks, and available reward codes.
- Connect production magic-link delivery through PATCH if dynamic one-time links are supported; otherwise use a transactional email provider.
- Add one end-to-end integration test for the MVP path.

## Keep Simple For MVP
- Use email and phone as the main duplicate-prevention keys, with ROLLER customer id as an additional match key.
- Let PATCH own stamp calculation and reward-code creation.
- Let the loyalty app own the customer-facing projection and display.
- Use manual refresh for the customer view.
- Use targeted backfill only when a webhook does not contain enough customer data.

## Magic Link Hardening
- Persist sessions in PostgreSQL instead of the current in-memory session map.
- Store only hashed session tokens, with expiry and revocation state.
- Set the session cookie with `Secure` in HTTPS environments.
- Tie account reads to the session `customer_id`; do not rely on `GET /account?email=...` for authenticated customer access.
- Add rate limiting for magic-link requests.
- Stop logging raw magic links outside local development.
- Connect production magic-link delivery through PATCH or a transactional email provider.

## Later
- Persist and enforce session tokens for account reads.
- Add inbound webhook authentication checks for ROLLER and PATCH routes.
- Add venue-scoped join routes if multi-location rollout requires them.
- Implement per-venue PATCH credentials.
- Implement used-code status updates. Current scheduler only logs active-code counts.
- Decide whether used-code verification is owned by PATCH automation, this app, or a separate reconciliation job.
- Add idempotency enforcement if duplicate provider event ids must be ignored.
- Add migration management instead of relying on inline `alter table ... if not exists` repairs in service code.
- Decide whether child/minor stamps roll up to parent accounts.
- Implement offer targeting that uses `visited_parks` and `home_park`.
