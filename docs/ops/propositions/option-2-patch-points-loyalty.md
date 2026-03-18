# Proposition: Patch Points Loyalty (No Custom Loyalty UI)

Last updated: 2026-03-18

## Summary

Use Patch as the loyalty engine now. Keep ROLLER for checkout, bookings, and core park operations. Show loyalty progress using Patch's own rewards experience.

## How loyalty works

1. Visitor buys tickets in ROLLER and is identified by account/contact data.
2. ROLLER data flows to Patch.
3. Patch calculates rewards and shows visitor-facing progress.
4. Marketing automations use Patch segments and triggers.

## How visitor data is captured

1. ROLLER checkout/account captures identity data.
2. Checkout and purchase events are available for tracking/automation.
3. Patch receives data from ROLLER for loyalty and campaigns.

## Why choose this

1. Fastest path to visible loyalty before native ROLLER points are clear.
2. Avoids building custom loyalty logic in WordPress.
3. Stronger lifecycle marketing and abandonment flows.

## Risks

1. Patch model is commonly points/currency style; strict stamp UX may not be exact.
2. Final migration path to future native ROLLER loyalty is not yet documented.
3. Requires API add-on and integration governance.

## Decision fit

Choose this if launch needs visible loyalty progress plus marketing impact with acceptable integration dependency.

## Sources

1. https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention
2. https://patchretention.com/loyalty-rewards
3. https://help.patchretention.com/loyalty-program-rewards-widget
4. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
