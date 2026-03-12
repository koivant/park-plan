# Marketing (Implementation)

Last updated: 2026-03-06

## Selected implementation direction

1. Build baseline lifecycle automation and abandoned-cart recovery.
2. Evaluate Patch first; keep Klaviyo/Campaign Monitor as alternatives.

## Technical steps

1. Enable checkout tracking foundation.
2. Connect selected marketing platform to ROLLER data source.
3. Configure core segment: new visitors.
4. Configure core segment: active visitors.
5. Configure core segment: inactive visitors.
6. Configure core segment: loyalty members.
7. Configure abandoned-cart automation (start trigger, timeout window, message channel).
8. Configure lifecycle automation: pre-visit.
9. Configure lifecycle automation: post-visit.
10. Configure lifecycle automation: win-back.
11. Configure campaign reporting for delivery, conversion, and revenue attribution.
12. Run pilot and tune triggers, timing, and message content.

## Required data

1. Checkout start event.
2. Purchase event.
3. Contact identifier (email or phone).
4. Consent status by channel.

## To investigate

1. Exact integration path and plan entitlement for selected platform.
2. Resume-link support behavior for abandoned carts.
3. Country-level channel consent constraints for automated messaging.
