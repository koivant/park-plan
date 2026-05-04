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

## Remaining
- [ ] Test PATCH `contact-updated` webhook end-to-end against real PATCH delivery.
- [ ] Test PATCH `reward-code` webhook end-to-end against real PATCH delivery.
- [ ] Verify PATCH webhook auth/header configuration in non-local environments.
- [ ] Integrate real OTP delivery provider (replace demo-only OTP response behavior).
- [ ] Implement real session/auth guard for account reads (token issuance, persistence, validation).
- [ ] Enforce inbound webhook authentication for PATCH and ROLLER routes.
- [ ] Implement discount-code lifecycle updates (`active` -> `used`/`expired`/`invalid`).
- [ ] Implement scheduled used-code verification against ROLLER and apply status updates.
- [x] Define and implement booking cancel/delete projection behavior (update status).
- [ ] Validate first-time enrollment sync path (`ROLLER -> PATCH -> loyalty API`) in staging.
- [ ] Add one end-to-end integration test for the full journey (Enrollment -> OTP login -> booking webhook -> PATCH loyalty update -> code redemption/use status).
