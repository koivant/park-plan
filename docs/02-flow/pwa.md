# PWA (Flow)

Last updated: 2026-03-12

Q: What is the PWA flow in this setup?
A:
1. Visitor opens the WordPress site (browser or installed app icon).
2. PWA serves fast app shell and cached static content.
3. Visitor browses park content and taps Buy tickets.
4. Visitor is sent to ROLLER hosted checkout (overlay or full-page).
5. Checkout, payment, and booking confirmation happen in ROLLER.
6. Visitor returns to park content or account entry points.

Q: How does offline behavior work in this flow?
A:
1. Static content pages can load from cache when connection is weak/offline.
2. Ticket checkout and payment do not work offline.
3. Visitor sees retry path when network returns.

Q: What is the safe flow rule for ROLLER routes?
A:
1. Do not aggressively cache checkout/payment routes.
2. Keep checkout links network-first and avoid service-worker interception that can break redirects/tracking.
3. Preserve campaign parameters when moving from WordPress to ROLLER.

Q: How does PWA flow work in WordPress multisite?
A:
1. Each park/country site has its own app identity (name/icons/theme colors).
2. Core PWA behavior can be shared across sites.
3. Park-specific pages, language, and campaigns remain local per site.

Q: Does PWA change loyalty and login flow?
A:
1. No backend change.
2. Login and loyalty logic still run in ROLLER and/or loyalty partner.
3. PWA only improves access speed and user experience.
