# Loyalty App Implementation TODO

## Scope
- Complete the end-to-end customer journey shown in the customer-journeys diagram.
- Loyalty reward rule uses the shared threshold from the implementation values document.

## Done
- [x] ROLLER booking webhook ingestion and projection updates.
- [x] ROLLER booking contact sync now requires enrollment for new customers and still updates follow-up bookings for existing customers.
- [x] ROLLER booking edit/cancel follow-up webhooks now update existing projected bookings even when email is missing.
- [x] ROLLER signed-waiver webhook ingestion and projection updates.
- [x] PATCH webhook handlers for contact-updated and reward-code are implemented.
- [x] PATCH webhook auth guard is implemented (config key + header validation).
- [x] PATCH REST API client is implemented with `Authorization` bearer token + `X-Account-Id` headers, plus a runnable access-check script.
- [x] OTP request and OTP verify API endpoints.
- [x] Account projection read endpoint (`GET /account`).
- [x] Park attribution persistence from ROLLER booking webhooks (`booking -> parkId`).
- [x] Customer park visit output in `GET /account` (`visited_parks`) derived from booking records.
- [x] Customer home park persistence support and `GET /account` output (`home_park`) when upstream data provides it.
- [x] Customer identity matching for booking ingestion supports email or phone.
- [x] Customer identity merge path implemented when separate email-only and phone-only records converge.
- [x] Webhook event metadata persistence for provider event id, event date, send date, and attempt timestamp.
- [x] Booking projection stores `bookingReference` and `rollerCustomerId` alongside `uniqueId`.
- [x] ROLLER booking ingestion supports venue-specific webhook path (`/webhooks/roller/:parkId/booking`) as park fallback.
- [x] ROLLER booking ingestion can resolve missing email/phone via guest detail lookup using `customerId`.

## Remaining
- [ ] Test PATCH `contact-updated` webhook end-to-end against real PATCH delivery.
- [ ] Test PATCH `reward-code` webhook end-to-end against real PATCH delivery.
- [ ] Verify PATCH webhook auth/header configuration in non-local environments.
- [ ] Integrate real OTP delivery provider (replace demo-only OTP response behavior).
- [ ] Implement real session/auth guard for account reads (token issuance, persistence, validation).
- [ ] Enforce inbound webhook authentication for PATCH and ROLLER routes.
- [ ] Implement PATCH used-code sync write-path (mark matching `discount_codes.is_used = true`).
- [ ] Implement offer-targeting rules that use `visited_parks` and `home_park` in the web view.
- [ ] Implement scheduled used-code verification against ROLLER and apply status updates.
- [x] Define and implement booking cancel/delete projection behavior (update status).
- [ ] Validate first-time enrollment sync path (`ROLLER -> PATCH -> loyalty API`) in staging.
- [ ] Add one end-to-end integration test for the full journey (Enrollment -> OTP login -> booking webhook -> PATCH loyalty update -> code redemption/use status).
