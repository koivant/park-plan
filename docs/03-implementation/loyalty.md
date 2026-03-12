# Loyalty (Implementation)

Last updated: 2026-03-06

## Selected implementation direction

1. Use ROLLER account identity (email and/or phone).
2. Evaluate partner-managed loyalty (Patch first).

## Technical steps

1. Confirm selected provider and contract scope.
2. Connect provider to ROLLER data/events.
3. Configure loyalty account key policy (email only, phone only, or both).
4. Configure qualifying visit logic.
5. Configure milestone rule and rewards (target model: `1 visit = 1 stamp`, reward at `6`).
6. Configure cashier redemption flow (account lookup and QR-assisted identification).
7. Configure reward notifications to guest.
8. Validate reporting for visit progress, reward issuance, and redemption.
9. Run pilot in one park group, then rollout.

## Data and ownership

1. Purchase/booking source: ROLLER checkout and POS.
2. Login source: ROLLER online accounts.
3. Stamp/points logic source: selected loyalty partner.

## To investigate

1. Can provider fully support our exact loyalty rules and edge cases for this account?  
   Meaning: confirm the provider can run our real rules (for example `1 qualifying visit = 1 stamp`, reward at `6`) and handle tricky cases correctly (duplicate purchases, cancellations/refunds, partial payments, same-day repeat visits, missed sync events, and manual corrections) without breaking stamp counts.
2. Which ROLLER events are available for reliable visit counting?
3. How are cancellations/refunds handled in loyalty counting rules?
4. What is the confirmed native ROLLER points rollout timeline and migration path?
5. Can selected provider support mascot-based personalization fields and milestone messaging?
6. Should mascot engagement be phase 2 after core loyalty mechanics are stable?
