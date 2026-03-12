# Verification Summary (2026-03-03)

Purpose: clearly separate facts from assumptions.

## Real (verified)

1. ROLLER supports full-page and overlay checkout.
2. ROLLER online accounts support email/phone/social login.
3. Membership self-service depends on progressive checkout + online accounts + ROLLER Payments.
4. ROLLER API supports external/custom checkout use cases.
5. API model includes venue-based keys and 1 request/second baseline limit.
6. WordPress multisite admin model used in planning is consistent with official docs.
7. ROLLER's "book online without paying" guide exists and says this feature is for **Legacy checkout**.
8. Legacy checkout and progressive checkout are documented as separate checkout paths.
9. Progressive checkout supports built-in web tracking integrations and standard conversion events.

## Uncertain (needs confirmation)

1. Exact endpoint URLs in `docs.roller.app` used in older notes.
2. Exact official statement for post-booking payment adjustment limits.
3. Exact hosting/data region for this specific customer tenant.
4. Some older third-party source links in earlier notes (stale URLs).
5. Whether pay-later can be enabled in progressive overlay checkout for this customer account.
6. Full feature scope and final release timing of built-in loyalty (support target is May 2026).

## Proposal (our planning, not vendor fact)

1. Loyalty model options and reward ideas.
2. Country-level rollout and messaging tactics.
3. Architecture choices beyond locked checkout decision.

## Main sources

1. https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview
2. https://mysupport.roller.software/hc/en-us/articles/360003171476-ROLLER-API-FAQ
3. https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages
4. https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website
5. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
6. https://mysupport.roller.software/hc/en-us/articles/7714106356367-Encourage-guests-to-self-serve-membership-upgrades-renewals-and-cancellations
7. https://developer.wordpress.org/advanced-administration/multisite/
8. https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying
9. https://mysupport.roller.software/hc/en-us/articles/360000103995-Create-a-Checkout
10. https://mysupport.roller.software/hc/en-us/articles/5517736807951-Boost-sales-with-progressive-checkouts
11. https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts
