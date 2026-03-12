# Checkout Concept (ROLLER Overlay)

Last updated: 2026-03-04

## Core idea

1. Use ROLLER hosted checkout in overlay mode on WordPress pages.
2. Keep product, pricing, and payment logic in ROLLER.
3. Use WordPress mainly for content, campaign pages, and park discovery.

## Why this is practical

1. Faster launch with less custom checkout code.
2. Lower payment/security scope for WordPress team.
3. Easier multi-country rollout with one checkout engine.

## What we need to decide

1. Per-country and per-park checkout link mapping.
2. Which markets can use "book now, pay in venue" and under which rules.
3. Contact capture timing (email/phone) for follow-up and loyalty.
4. Tracking setup (GTM + GA4 + paid media pixels).

## Technical focus points

1. Ensure consistent URL parameters for campaign tracking (UTM = Urchin Tracking Module tags, such as `utm_source`, `utm_medium`, `utm_campaign`).
2. Validate event tracking from checkout to analytics tools.
3. Define support process for failed/incomplete bookings.
