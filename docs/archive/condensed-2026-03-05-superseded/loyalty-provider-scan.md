# Loyalty Provider Scan (No Custom Interim Build)

Last updated: 2026-03-04

## Decision context

1. Custom interim loyalty build was explored.
2. It is not selected due to maintenance and development cost.
3. We need an established provider that integrates with ROLLER for a stamp-like program.

## Shortlist from ROLLER partner directory + web research

## 1) Patch Retention (strongest current option)

Verified:
1. Listed as a live ROLLER partner.
2. Uses direct ROLLER API integration and requires ROLLER API add-on.
3. Supports loyalty programs and loyalty reporting.
4. Patch loyalty settings support points earning/redemption rules.
5. Patch has docs for adjusting loyalty points and loyalty program administration.
6. Patch + ROLLER data sync includes contact fields and booking/order data (with email/phone requirement for order sync in Patch).

Fit for stamp model:
1. Likely feasible by mapping a visit event to point/stamp accrual and issuing reward at threshold.
2. Exact "1 visit = 1 stamp" configuration path must be confirmed with Patch for ROLLER venues.

## 2) Book More (possible, but not a confirmed stamp engine)

Verified:
1. Listed as ROLLER partner with beta integration status.
2. Mentions "Text Club & Loyalty Marketing" and recurring engagement features.

Uncertain:
1. Public material does not clearly confirm a native stamp/points engine tied to ROLLER transactions.

## 3) PlaySpark (interesting for gamified milestones, but not live)

Verified:
1. Listed as ROLLER partner with "Coming Soon" integration status.
2. Mentions membership/visit milestones (for example 5th, 10th visit) and reward drops.

Uncertain:
1. Not live in ROLLER directory yet.
2. Commercial fit for core loyalty operations vs campaign/gamification needs.

## Outside partner list (internet scan)

1. No clearly documented live "stamp card" provider with public proof of direct ROLLER integration was found in this pass beyond Patch/partner options above.

## Recommendation

1. Start vendor discovery with Patch first.
2. In discovery, confirm hard requirements:
   - `1 qualified visit = 1 stamp` logic
   - `6 stamps = free day pass` reward rule
   - support for email-first and phone/WhatsApp-first markets
   - POS redemption flow and anti-abuse controls
3. Keep Book More and PlaySpark as secondary options until capabilities and timeline are clearer.

## Sources

1. https://www.roller.software/integrations/partner/patch-retention
2. https://help.patchretention.com/account-settings-loyalty
3. https://help.patchretention.com/loyalty-settings
4. https://help.patchretention.com/how-to-adjust-a-contacts-loyalty-points
5. https://help.patchretention.com/what-data-fields-are-mapped-from-roller-to-patch
6. https://www.roller.software/integrations/partner/book-more
7. https://www.roller.software/integrations/partner/playspark
8. https://www.roller.software/integrations
9. https://www.roller.software/integrations/partner/mailchimp
