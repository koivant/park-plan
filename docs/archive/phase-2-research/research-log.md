# PHASE 2 Research Log

Last updated: 2026-03-03

This is a short log of the most important findings.

## Key verified findings

1. **API basics**
   - OAuth-based API access, venue-based keys, HQ multi-venue keys, and 1 request/second limit.
   - Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview

2. **Checkout options**
   - ROLLER checkout supports full-page and overlay modes.
   - Source: https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages
   - Source: https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website

3. **Account login**
   - Online account login supports email, phone, and social sign-in.
   - Source: https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts

4. **Membership self-service requirements**
   - Requires progressive checkout + online accounts + ROLLER Payments.
   - Source: https://mysupport.roller.software/hc/en-us/articles/7714106356367-Encourage-guests-to-self-serve-membership-upgrades-renewals-and-cancellations

5. **External/custom checkout is possible**
   - API FAQ confirms this path.
   - Source: https://mysupport.roller.software/hc/en-us/articles/360003171476-ROLLER-API-FAQ

6. **Pay later / book now pay later**
   - ROLLER documents this flow, but the guide states it is available with **Legacy checkout only**.
   - Source: https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying

7. **Legacy checkout meaning**
   - Legacy checkout is the older checkout product and is managed separately from progressive checkout.
   - Sources:
     - https://mysupport.roller.software/hc/en-us/articles/360000103995-Create-a-Checkout
     - https://mysupport.roller.software/hc/en-us/articles/5517736807951-Boost-sales-with-progressive-checkouts

8. **Progressive checkout tracking**
   - ROLLER supports GA4, Meta Pixel, TikTok Pixel, and GTM (by plan level), with native checkout events such as `add_to_cart`, `begin_checkout`, and `purchase`.
   - Source: https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts

9. **ROLLER support roadmap update (vendor communication)**
   - Support says built-in loyalty is targeted for May 2026.
   - More detail expected in March 2026.
   - Interim solution is optional before launch.
   - Source: docs/meetings/2026-03-03-roller-support-update.md

10. **Marketing platforms for abandoned cart and lifecycle**
   - Campaign Monitor, Klaviyo, and Patch can all support retention and conversion goals with different complexity levels.
   - Source: docs/phase-2-research/marketing-platform-options.md

11. **Roadmap comparison: loyalty now vs planned**
   - Current docs show membership-based loyalty features are available now.
   - Roadmap PDF shows a planned native points-based loyalty program.
   - Source: docs/phase-2-research/loyalty-current-vs-roadmap.md

## Important but not fully verified yet

1. Exact `docs.roller.app` endpoint URLs used earlier.
2. Exact primary source for post-booking payment adjustment limitation.
3. Exact data hosting region for this customer account.
4. Whether "allow pay later" can be enabled in progressive overlay for this specific account setup.
5. Confirm exact park plan tier/add-ons needed for GTM and paid pixel support.
6. Public release notes and final scope for built-in loyalty feature.
7. Select one interim marketing platform path (or none) for pilot.
8. Confirm exact launch scope/date for native points-based loyalty.

## Next research actions

1. Confirm webhook events needed for booking/payment/membership sync.
2. Confirm final API access boundaries for franchise model.
3. Get written ROLLER confirmation for payment-adjustment behavior.
4. Confirm region-level legal ownership for consent and messaging rules.
5. Get written ROLLER confirmation on pay-later behavior for progressive overlay checkout.
6. Define tracking baseline rollout: GA4 first, then paid pixels by market.
7. Review detailed built-in loyalty docs when released in March 2026.
8. Choose marketing pilot stack and KPI baseline.
9. Re-check roadmap loyalty status when March detailed release information is published.
