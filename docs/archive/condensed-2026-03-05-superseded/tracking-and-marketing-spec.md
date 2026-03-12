# Tracking and Marketing Spec

Last updated: 2026-03-04

## Baseline setup

1. Enable progressive checkout web tracking in ROLLER.
2. Start with GA4 for funnel baseline.
3. Add Meta/TikTok only in markets running those channels.
4. Add GTM only when custom tags or additional tools are needed.

## UTM naming standard (URL campaign tags)

1. Always include `utm_source`, `utm_medium`, `utm_campaign`.
2. Optional: `utm_content`, `utm_term`.
3. Use lowercase and hyphen-separated names.
4. Keep one global naming convention across countries.

## Abandoned cart recovery technical path

1. Capture checkout start and purchase events.
2. Detect drop-off by delay rule.
3. Trigger message through selected marketing platform.
4. Send resume link if platform supports cart-link recovery.

## Platform selection guidance

1. Campaign Monitor: simpler email-first automation.
2. Klaviyo: advanced segmentation and cross-channel flows.
3. Patch: attraction-focused retention journeys and guided setup.

## Confirmation needed before rollout

1. Account plan/add-on access for GTM and paid pixels.
2. Confirm exact integration route for chosen marketing tool.
3. Confirm consent model per market and channel.
