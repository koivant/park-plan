# Tracking (Concept)

Last updated: 2026-03-18

Q: Can we migrate tracking data from old systems to new? (Account for consent rules)
A: Partly. ROLLER provides checkout event tracking and integrations, but a full public guide for historical backfill from an old system was not found in this review (research needed). Consent handling must be validated before importing or activating user-level tracking.
Source: https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts
Source: https://mysupport.roller.software/hc/en-us/articles/7835988980751-Request-guest-cookie-consent-before-tracking-checkout-activity
Source: https://support.google.com/analytics/answer/10071301
Source: https://support.google.com/analytics/answer/9976101

Q: What does ROLLER progressive checkout tracking support out of the box?
A: It supports standard ecommerce and checkout events, and can send them to GA4, Meta and TikTok. GTM support is also available when enabled.
Source: https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts

Q: Do tracking options depend on ROLLER plan/add-ons?
A: Yes. GA4 tracking is available on all plans, while some options (for example Meta/TikTok and GTM) depend on plan tier or add-ons.
Source: https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts

Q: Can checkout ask for cookie consent before tracking?
A: Yes. Progressive checkout can request cookie consent before tracking, and you can customize consent labels/text.
Source: https://mysupport.roller.software/hc/en-us/articles/7835988980751-Request-guest-cookie-consent-before-tracking-checkout-activity

Q: Is there a sandbox environment for multi-park testing?
A: Yes, with limits. Each venue has a Playground copy for testing without affecting live operations. API credentials can access production and playground environments, and HQ can create API keys across multiple venues. You still need per-venue test setup.
Source: https://mysupport.roller.software/hc/en-us/articles/360000298275-ROLLER-Playground
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview

Q: What API limits should we design around?
A: Public docs specify two key limits: 1) one API call per second per credential set, and 2) monthly API call package limits per venue with excess-call charges.
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview
Source: https://mysupport.roller.software/hc/en-us/articles/4410780591759-Manage-API-excess-call-usage

Q: What webhook delivery guarantees should we design around?
A: Public docs in this review do not publish a full webhook SLA. What is documented: retry behavior exists, and if all seven retry attempts fail, ROLLER disables the webhook. Build idempotent consumers and monitor failure alerts.
Source: https://mysupport.roller.software/hc/en-us/articles/14350368795663-November-2025-product-updates
