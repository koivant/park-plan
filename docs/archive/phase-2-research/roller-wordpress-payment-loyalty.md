# ROLLER + WordPress Payment and Loyalty Plan

Last updated: 2026-03-03

## Locked decision

1. Checkout will use **ROLLER hosted overlay checkout**.
2. WordPress will not run its own custom checkout at launch.

## What is confirmed from ROLLER docs

1. ROLLER supports website checkout in full-page or overlay mode.
2. Online accounts support login with email, mobile, and social options.
3. Membership self-service requires progressive checkout + online accounts + ROLLER Payments.
4. API-based external/custom checkout is possible if needed later.
5. API access is venue-based, and HQ can use multi-venue credentials.
6. "Book online without paying" (`pay later`) is documented as **Legacy checkout only**.

## Vendor roadmap note (from support)

1. Built-in ROLLER loyalty is targeted for **May 2026**.
2. More detail is expected in **March 2026**.
3. Until details are published, keep interim loyalty options open.

## What "Legacy checkout" means (plain language)

1. It is ROLLER's older checkout system.
2. It is separate from progressive checkout.
3. In Venue Manager, it appears under `Apps > Legacy checkouts`.
4. Some guides are written specifically for legacy, and others for progressive.

## What WordPress does

1. Park pages, campaign pages, SEO, and local content.
2. Buttons that open ROLLER overlay checkout.
3. Optional "My account" links to ROLLER account pages.
4. Holds campaign tags and links used for analytics attribution.

## What ROLLER does

1. Checkout and payment flow.
2. Account login and membership management.
3. Booking, membership, and redemption data.
4. Checkout event tracking integration (GA4/Meta/TikTok/GTM by plan).

## Open technical questions

1. Exact webhook events we can use in this project.
2. Final key/permission model for franchise-level access.
3. Final confirmation of post-booking payment adjustment limits in API docs.
4. If "pay later" is required in this project, confirm whether progressive/overlay supports it for this account.
5. Final plan tier/add-ons needed for desired tracking stack.
6. Final scope of built-in loyalty and migration path from interim approach.

## If custom checkout is needed later

Use custom checkout only for a clear business reason.  
It adds more build cost, support cost, and failure risk.

## Sources

1. https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages
2. https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website
3. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
4. https://mysupport.roller.software/hc/en-us/articles/7714106356367-Encourage-guests-to-self-serve-membership-upgrades-renewals-and-cancellations
5. https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview
6. https://mysupport.roller.software/hc/en-us/articles/360003171476-ROLLER-API-FAQ
7. https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying
8. https://mysupport.roller.software/hc/en-us/articles/360000103995-Create-a-Checkout
9. https://mysupport.roller.software/hc/en-us/articles/115001721873-Add-your-checkout-to-your-website-Legacy
10. https://mysupport.roller.software/hc/en-us/articles/5517736807951-Boost-sales-with-progressive-checkouts
