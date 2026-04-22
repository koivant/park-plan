# Loyalty App QA

## Scope Checks
- App is deployable and runnable independent of WordPress.
- WordPress only links to app URL.
- PWA scope is limited to the loyalty app URL path.
- Account view is served by app server.

## Functional Checks
- User can log in and open account page.
- Account page shows name/email, booking history, active bookings, waiver status, loyalty progress.
- Account page is view-only (no self-edit controls for personal data).
- Booking and waiver updates are reflected after webhook or reconciliation.

## Integration Checks
- ROLLER REST calls succeed for bookings, booking detail, waiver detail, discount detail when used.
- PATCH contacts lookup by email returns loyalty integer custom field used by UI.
- ROLLER webhook events are validated, idempotent, and replay-safe.

## Reliability Checks
- Scheduler reconciliation repairs missed webhook updates.
- Retry handling covers transient provider failures.
- Cache hit/miss behavior is correct.
- Cache invalidation occurs on booking, waiver, and loyalty updates.

## Security Checks
- Session/OTP controls enforced.
- Customer flow has no ROLLER account login dependency.
- Sensitive values are not logged in plaintext.
- Data retention and deletion controls operate as expected.
