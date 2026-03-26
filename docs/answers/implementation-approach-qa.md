# Implementation Approach Q&A

Last updated: 2026-03-26

Q: How should checkout be implemented in baseline scope?
A:
1. Configure products/pricing/availability in ROLLER.
2. Create park-specific hosted checkout links.
3. Route WordPress CTAs to those links with UTM tags.
4. Validate end-to-end path (page -> checkout -> purchase confirmation).
5. Add QR destinations for waiver, checkout, and service points.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
2. https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout
3. https://mysupport.roller.software/hc/en-us/articles/360001569556-Improve-your-guest-arrival-flow-with-QR-codes-for-waiver-completion

Q: How should loyalty be implemented in baseline scope?
A:
1. Use ROLLER account identity (email/phone).
2. Connect selected loyalty provider (Patch-first evaluation).
3. Define qualifying visit logic and milestone reward rules.
4. Define cashier redemption and manual-correction flow.
5. Pilot in one park group before broad rollout.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
2. https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention
3. ../sources/internal-evidence.md#ie-003-owner-loyalty-strategy-input-2026-03-06

Q: How should marketing and tracking be implemented in baseline scope?
A:
1. Enable checkout tracking foundation first.
2. Connect selected marketing platform.
3. Configure minimum segments: new, active, inactive, loyalty.
4. Configure abandoned-cart and lifecycle automations.
5. Track delivery, conversion, and revenue attribution.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts
2. https://help.patchretention.com/how-to-set-up-the-roller-abandoned-cart-automation
3. https://mysupport.roller.software/hc/en-us/articles/7835988980751-Request-guest-cookie-consent-before-tracking-checkout-activity

Q: How should PWA be implemented safely?
A:
1. Keep PWA scope on WordPress content/app-shell behavior.
2. Exclude checkout/payment handoff routes from aggressive caching.
3. Keep checkout/payment online-only.
4. Preserve campaign parameters on handoff URLs.
5. Run regression tests for checkout open and tracking continuity.
Sources:
1. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
2. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
3. https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
4. https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts
