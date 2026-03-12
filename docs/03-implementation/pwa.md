# PWA (Implementation)

Last updated: 2026-03-12

## Selected implementation direction

1. Implement PWA at WordPress layer only.
2. Keep checkout, payment, bookings, and loyalty backend logic in ROLLER/Patch.

## Technical steps

1. Define PWA scope: content pages, park info, campaign landing pages, account entry points.
2. Add per-site web app manifest (`name`, `icons`, `theme_color`, `start_url`) in multisite.
3. Register service worker in WordPress theme/plugin.
4. Configure caching strategy: precache static shell assets (CSS, JS, logo/icons), use `stale-while-revalidate` for CMS content pages, and use `network-first` for dynamic pages and all ticket/account handoff links.
5. Exclude checkout/payment routes from aggressive caching and offline fallbacks.
6. Keep Buy tickets CTAs linking to ROLLER hosted checkout (overlay/full-page as selected).
7. Preserve campaign URL parameters in links to ROLLER.
8. Add offline fallback page with clear retry CTA.
9. Test installability and behavior on iOS/Android home screen.
10. Run regression tests for: CTA links, overlay/full-page checkout opening, tracking continuity.

## Data and ownership

1. PWA shell and caching rules source: WordPress.
2. Checkout and payment source: ROLLER.
3. Loyalty rules source: ROLLER and/or selected loyalty partner.
4. Campaign tracking attribution source: shared (WordPress entry + ROLLER checkout events).

## To investigate

1. Should service worker be network-wide (multisite shared) or per-site isolated?
2. Which exact URL patterns must be excluded from service-worker caching to avoid checkout/tracking issues?
3. Should web push notifications be in launch scope or phase 2?
4. Which analytics events should be added for PWA behavior (`install`, `open_from_icon`, `offline_fallback`, `retry_checkout`)?
