# Loyalty Login Model (Simple View)

Last updated: 2026-03-04

## How visitors log in

1. Visitor opens checkout from your WordPress page.
2. Checkout opens as a ROLLER overlay.
3. Visitor signs in or creates a ROLLER online account.
4. Visitor can view and use memberships/passes in that account.

## Where data is stored

1. Loyalty and booking data are stored in ROLLER systems.
2. ROLLER states it uses AWS and has SOC 2 / PCI DSS controls.
3. Exact data region for your tenant is not confirmed publicly and must be asked from ROLLER.

## Where the user interface is hosted

1. Login and loyalty account screens are hosted by ROLLER.
2. WordPress hosts your marketing/content pages and launch buttons.

## What is out of the box vs custom

## Out of the box (ROLLER)

1. Account creation and login.
2. Membership visibility and member self-service (when enabled).
3. Account links you can place on your website.

## Custom build (only if needed)

1. Fully custom loyalty UI outside ROLLER account pages.
2. Custom cross-system automation and segmentation flows.
3. Extra data pipelines for non-standard reporting.

## Roadmap note

1. ROLLER support says built-in loyalty is targeted for May 2026.
2. Detailed feature information is expected in March 2026.
3. Keep interim loyalty plans flexible until those details are available.

## Growth playbook (plain and practical)

## Get more signups

1. Show "My account" clearly on key pages.
2. Invite account creation right after purchase.
3. Show real member benefits next to buy buttons.

## Get more repeat logins

1. Send reminders about remaining benefits.
2. Send renewal/reactivation prompts.
3. Keep one clear member page with login + offers.

## Get more perk usage

1. Keep perks easy to understand.
2. Ask front-desk staff to remind guests about unused perks.
3. Add pre-visit reminders with direct login links.

## Stamp journey (visitor view)

1. Visitor buys online or at the counter.
2. System captures visitor identity with email or phone.
3. Qualified visit adds one stamp.
4. Visitor receives progress update (example: `3/6 stamps`).
5. At `6/6` stamps, visitor receives a free day-pass reward code/QR.
6. Visitor redeems reward at cashier by QR/code or account lookup.

## Email vs WhatsApp/phone (visitor communication)

1. `Email` suits account links and longer content.
2. `Email` is usually better in email-first markets.
3. `WhatsApp/phone` suits quick reminders in phone-first markets.
4. `WhatsApp/phone` makes in-venue showing of reward message/QR easy.
5. Both require market-level consent handling.

## Sources

1. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
2. https://mysupport.roller.software/hc/en-us/articles/7433970393871-Configure-online-accounts-in-progressive-checkouts
3. https://mysupport.roller.software/hc/en-us/articles/7714106356367-Encourage-guests-to-self-serve-membership-upgrades-renewals-and-cancellations
4. https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website
5. https://www.roller.software/security
