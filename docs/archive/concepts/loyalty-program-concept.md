# Loyalty Program Concept

Last updated: 2026-03-04

## Core idea

1. Reward repeat visits with a simple stamp model.
2. Start with: `1 qualified visit = 1 stamp`, `6 stamps = 1 free day pass`.
3. Keep rules clear for guests and staff.

## Why this can work

1. Easy to explain at park counter and online.
2. Clear short-term goal for guests.
3. Encourages return visits without complex app features.

## What we need to decide

1. What counts as a qualified visit.
2. Identity method by market (email vs phone/WhatsApp).
3. Abuse protection (for example max 1 stamp/day/guest).
4. Redemption rules (validity, one-time use, transfer allowed or not).

## Interim vs native ROLLER loyalty

1. Build only minimum interim features.
2. Keep data model simple for future migration.
3. Re-check plan when ROLLER native loyalty details are confirmed.

## Visitor journey (real life)

1. Visitor buys online or at the park counter.
2. Staff or checkout captures identity (`email` or `phone`).
3. One qualified visit adds one stamp.
4. Visitor gets a progress message (example: `3/6 stamps`).
5. At `6/6`, visitor gets a free day-pass reward code/QR.
6. Visitor redeems at cashier by showing code/QR or by account lookup.

## Email vs WhatsApp/phone

1. `Email` is good for account links and longer messages.
2. `Email` works best in markets where email use is strong.
3. `WhatsApp/phone` is good for fast message open rates in phone-first markets.
4. With `WhatsApp/phone`, visitor can show message or QR directly at the cashier.
5. In all markets, local consent rules must be followed.
