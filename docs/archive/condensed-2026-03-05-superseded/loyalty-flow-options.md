# Loyalty Flow Options

Last updated: 2026-03-04

## Option A: ROLLER-only (membership loyalty)

1. Visitor creates/signs in to ROLLER account.
2. Visitor buys membership/pass.
3. Visitor receives membership benefits.
4. Staff verifies/redeems benefits at POS.

Use when:
1. You do not need stamp/points logic now.

## Option B: Partner-managed stamp/points layer (current preferred direction)

1. Visitor buys online or at counter.
2. Identity captured by email or phone.
3. Partner platform reads transaction/visit data from ROLLER integration.
4. Partner loyalty logic adds stamp/points if visit is valid.
5. At `6` stamps, reward is issued.
6. Visitor receives reward message with code/QR.
7. Cashier redeems reward at venue.

Use when:
1. You need digital stamp logic before native ROLLER points loyalty is live, without custom build.

## Option C: Wait for native ROLLER points loyalty

1. Continue with membership-led loyalty only for now.
2. Move to native points when feature scope and rollout are confirmed.

Use when:
1. You prefer lowest integration complexity and can wait for rollout timing.

## Visitor communication variants

1. Email-first flow for email-dominant markets.
2. Phone/WhatsApp-first flow for phone-dominant markets.

## Not selected

1. Custom interim loyalty build (explored, then rejected for cost/maintenance reasons).
