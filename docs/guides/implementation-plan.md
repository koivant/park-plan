# Implementation Plan

## Goal
Prove the MVP flow before adding hardening or extra features: ROLLER booking data becomes a loyalty customer account, PATCH supplies stamp state, and the customer can view bookings, tickets, and loyalty status in the loyalty app.

## MVP Flow
1. Park visitor enrolls or is matched.
2. ROLLER booking webhook arrives.
3. Loyalty app stores booking and customer projection.
4. ROLLER/PATCH native sync updates PATCH contact and stamp state.
5. PATCH webhook sends loyalty state to the loyalty app.
6. Customer opens the web/PWA view.
7. Web/PWA reads `GET /account` and presents bookings, tickets, stamps, and reward codes.

## Enrollment
The simplest MVP enrollment path is the demo `/join` form. It stores name, email, and phone in `customers`, marks the account as pending, and blocks duplicate signup by email or phone.

Event-driven enrollment is also supported when provider events contain enough identity data. Booking ingestion can create or update customers from normalized email, phone, or ROLLER customer id. PATCH contact updates can do the same from email, phone, PATCH contact id, and ROLLER id.

If a booking webhook has `customerId` but no email or phone, the app can request ROLLER guest detail when credentials are configured. This is the current targeted backfill mechanism for missing booking contact data.

## Duplicate Prevention
For MVP, duplicate prevention should stay simple:

- Normalize email before matching.
- Normalize phone before matching.
- Match by ROLLER customer id when available.
- Merge records when separate email-only and phone-only records later resolve to the same customer.
- Do not create a new customer from a booking unless enrollment is allowed or the customer already exists.

The current code supports email, phone, and ROLLER customer id matching. It also merges converging identity records.

## ROLLER To App
Booking webhooks are accepted at `/webhooks/roller/booking` and `/webhooks/roller/:parkId/booking`. The park path variant is useful when the payload does not include park identity.

The app stores the raw event, normalizes booking fields, links the booking to a customer when possible, and upserts the booking projection. The account view then reads this projection rather than calling ROLLER live.

Signed-waiver webhooks are accepted at `/webhooks/roller/signed-waiver`. Waiver data is useful for the customer account view, but booking and stamp flow should stay the MVP priority.

## ROLLER To PATCH
PATCH documents that its ROLLER integration syncs contact data, orders/bookings, guardian/minor relationship data, and cancellation effects into PATCH. For MVP, use that native provider sync for stamp calculation instead of duplicating stamp logic in the loyalty app.

The app should verify in sandbox that a ROLLER booking creates or updates the expected PATCH contact and stamp fields. If PATCH does not receive enough data from ROLLER, fix provider mapping first before adding app-side complexity.

## PATCH To App
PATCH webhook configuration uses a dynamic location path, for example `/webhooks/patch/glasgow/contact-updated`. The location segment identifies the park for the webhook and determines the customer's current home park for MVP.

This location pattern applies to PATCH webhooks generally:

- Contact update: `/webhooks/patch/:location/contact-updated`.
- Reward code: `/webhooks/patch/:location/reward-code`.

The PATCH payload meaning does not otherwise change. Contact updates store loyalty points, optional loyalty target, PATCH contact id, ROLLER id, email, and phone when present. Reward-code updates extract `discount_code` and store active reward codes for display.

The loyalty app does not calculate stamp thresholds or create reward codes in the current MVP. PATCH owns stamp calculation and reward-code creation.

## Backfill
Backfill should exist only to fill gaps that block the MVP account view:

- Use ROLLER guest detail lookup when booking webhook data has `customerId` but no email or phone.
- Use PATCH contact lookup to confirm contact and stamp fields during sandbox validation.
- Avoid broad ROLLER Data API reads for live account display. ROLLER Data API is for periodic export, not real-time customer views.

Backfill success means the account projection has enough data to show the customer profile, bookings/tickets, stamp state, and reward codes.

## Multi-Park Sync
For MVP, every customer account should have one local identity record that can collect bookings from multiple parks.

Current code stores `home_park`, `visited_parks`, booking `park_id`, and booking `park_name`. Booking webhook path park id can fill missing park identity. PATCH webhook location paths provide the current home park for PATCH-originated updates. PATCH payload fields can still provide explicit home park values when available.

Per-venue PATCH credentials are not implemented. Keep multi-park validation focused on whether the same email, phone, or ROLLER customer id maps to the same local customer across parks.

## Customer View
The customer-facing web/PWA should be a thin view over `GET /account`.

MVP display blocks:

- Customer profile: name, email, phone.
- Loyalty: current stamp count, target if PATCH provides it, and available reward codes.
- Bookings and tickets: booking reference/id, park, date/time, status, and ticket count.
- Parks: home park and visited parks.
- Waiver status when available.

Do not add complex personalization, push updates, or offer targeting until the MVP flow is reliable. Manual refresh is enough for MVP.

## Validation Checklist
- Create or identify a test customer.
- Enroll the customer through `/join` or provider-side customer creation.
- Create a ROLLER booking for the customer.
- Confirm ROLLER booking webhook reaches the app.
- Confirm the app links the booking to the expected customer.
- Confirm PATCH receives the ROLLER booking through native sync.
- Confirm PATCH updates loyalty/stamp fields.
- Confirm PATCH webhook reaches the app.
- Confirm `GET /account` shows customer profile, booking/ticket data, stamp state, and reward code data when applicable.
- Confirm a second booking from the same or another park updates the same customer instead of creating a duplicate.
- Confirm the web/PWA view presents the same projection clearly.

## Later Hardening
Security and operational hardening should follow the MVP proof:

- Real OTP delivery.
- Persisted sessions and account-read authorization.
- Inbound webhook authentication.
- Idempotent webhook processing.
- Full per-venue credential routing.
- Used-code verification and reconciliation.
- Migration management.

## Sources
- [ROLLER Data API](https://mysupport.roller.software/hc/en-us/articles/360001653475-Data-API)
- [ROLLER API terms](https://www.roller.software/api-terms-of-service)
- [PATCH ROLLER mapped data](https://help.patchretention.com/what-data-fields-are-mapped-from-roller-to-patch)
- [PATCH ROLLER setup](https://help.patchretention.com/how-to-setup-the-patch-roller-integration)
- [PATCH contact fields](https://help.patchretention.com/account-settings-fields-contact-level)
