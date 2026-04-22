# API Contracts

## Feasibility Verdict
- The requested flow is possible with a webhook-first design.
- Purchase and cancellation can be tracked from booking webhook events.
- Park visit can be tracked from redemption webhook events.
- Free-pass voucher flow is modeled as PATCH-managed one-time code generation and PATCH-to-ROLLER sync.
- REST can stay minimal.
- Cancellation handling is external-event driven in this pilot.

## Verified In ROLLER Docs
- Webhook registration endpoint: `POST /webhooks` ([REST docs](https://docs.roller.app/docs/rest-api/3a934c551891e)).
- Webhook listing endpoint: `GET /webhooks` ([REST docs](https://docs.roller.app/docs/rest-api/ebd73c57a6e38)).
- Webhook delete endpoint: `DELETE /webhooks/{webhookId}` ([REST docs](https://docs.roller.app/docs/rest-api/3005de801c781)).
- Booking webhook events: `Created`, `Updated`, `Cancelled` ([booking webhook events](https://docs.roller.app/docs/webhooks/c9ntvneweithh)).
- Redemption webhook events: `Created` ([redemption webhook events](https://docs.roller.app/docs/webhooks/zn5hys30vqord)).
- Booking webhook payload uses booking payload model (`BookingDetail`) ([webhook payload model](https://docs.roller.app/docs/webhooks/1tjb4whgq33f0)).
- `BookingDetail` includes `discount` amount ([booking detail](https://docs.roller.app/docs/rest-api/armugwijxjpqd)).
- `POST /bookings/{uniqueId}/cancel` exists, but it is limited to bookings created via API ([cancel booking endpoint](https://docs.roller.app/docs/rest-api/ymjdvd0uty55b), [endpoint caveat](https://docs.roller.app/docs/rest-api/p1hl65q4xzh0a)).

## Undocumented In ROLLER Docs
- PATCH loyalty field increment/reset rules.
- PATCH field mapping keys for loyalty counter logic.
- PATCH webhook availability and event schema (not verified from ROLLER docs).
- PATCH one-time voucher creation, PATCH-to-ROLLER voucher sync, and PATCH automation webhook schema (not verified from provided docs).
- OTP login flow (app-specific).
- Verified: `BookingCreateDiscount` has `code` ([booking create discount model](https://docs.roller.app/docs/rest-api/p1hl65q4xzh0a)).
- Not verified: `BookingDetail` exposing discount code value in webhook payload.

## Recommended Implementation
- Use booking and redemption webhooks as the primary update source.
- Store idempotent webhook events and update a local read model.
- Assume ROLLER updates PATCH loyalty field on purchase/edit/cancel events.
- Assume PATCH creates one-time free-pass codes at loyalty threshold and syncs them to ROLLER validation.
- Loyalty app consumes PATCH webhook updates and stores local read model snapshots.
- Deliver free-pass code to loyalty app via PATCH automation webhook (`POST /webhooks/patch/reward-code`) or by reading PATCH custom field on account fetch.
- If PATCH supports outbound webhooks, consume those as the primary PATCH-to-app sync path.
- Keep PATCH REST pull as an optional secondary sync mode (periodic reconciliation), not a fallback.
- Store reward state (`available`, `acquired`, `used`) when code is received from PATCH.
- No REST fallback path for failed webhook processing in pilot.
- On processing errors, log failed webhook events with no automatic retries in pilot.
- Cancellation is treated as an external event.
- Loyalty app does not provide cancellation action in Web/PWA.
- Booking `Cancelled` webhook updates loyalty state and booking state in the read model.
- Children stamps proposition: increment the parent loyalty counter when child tickets are explicitly linked to the parent account in booking data; otherwise increment only the booking owner.
