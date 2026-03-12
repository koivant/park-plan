# Implementation TODOs

Last updated: 2026-03-12

1. Checkout: confirm ROLLER account support for pay-in-venue in progressive overlay.
2. Checkout: confirm required ROLLER plan tier/add-ons for full tracking (GTM, paid pixels, and required integration/API access).
3. Loyalty: run partner discovery and confirm exact support for `1 visit = 1 stamp`, `6 = reward`.
4. Loyalty: confirm API/event coverage for selected provider and account key compatibility (email/phone).
5. Loyalty: confirm edge-case handling (duplicates, cancellations/refunds, partial payments, same-day repeats, missed sync events, manual corrections).
6. Loyalty: confirm native ROLLER points rollout scope and migration path.
7. Loyalty: confirm mascot-based personalization support and decide if mascot layer is phase 2.
8. Marketing: confirm tracking/integration entitlements and chosen platform connection path.
9. Marketing: confirm consent handling for recovery and lifecycle messaging.
10. Loyalty (ask Patch): confirm which API endpoints return points/stamp progress for custom UI and what auth/rate limits apply.
11. Loyalty (ask Patch): confirm WordPress plugin/widget behavior in multisite (per-site config, identity matching, and localization support).
12. Loyalty (ask ROLLER + Patch): confirm cross-system identity mapping rules (email/phone precedence, merge logic, and duplicate handling).
13. Loyalty (ask Patch): confirm whether points-vs-cash display toggle is available for non-eCommerce ROLLER accounts.
14. Loyalty (ask Patch): if no native timeline/stamp-track widget exists, define minimum API payload needed for custom WordPress progress component.
