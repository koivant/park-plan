# Progressive Checkout Tracking (Key Points)

Last updated: 2026-03-03

Source reviewed:

1. https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts

## What ROLLER tracks natively

Progressive checkout can send these standard events:

1. `page_view`
2. `view_item_list`
3. `view_item`
4. `add_to_cart`
5. `begin_checkout`
6. checkout step progress
7. `remove_from_cart`
8. `purchase`

## Supported tracking tools

1. GA4 (all plans)
2. Meta Pixel (Pro+)
3. TikTok Pixel (Pro+)
4. GTM (Premium+ or paid add-on)

## Where setup happens

In Venue Manager:

1. `Apps > Progressive checkouts > Settings > Web tracking`
2. Paste the tool ID (GA4/Meta/TikTok/GTM)
3. Select `Activate`

Permission needed:

1. `Can manage online checkout settings`

## Important implementation notes

1. If website and checkout use different domains (for example your site + `roller.app`), set up GA4 cross-domain tracking.
2. If you use a ROLLER custom checkout domain that matches your website domain, cross-domain setup is usually not needed.
3. Overlay tracking with GA4 can be limited in Safari due to browser tracking restrictions.
4. Google Ads is not directly integrated; recommended path is GA4 linking.
5. GTM can be used for:
   - custom events
   - extra tools (for example Hotjar/Klaviyo/Microsoft Ads)
   - server-side tracking (better data capture when browser blocking is strong)

## Useful operational notes

1. You can test tracking setup in playground before production.
2. If venue is in California, review CIPA guidance before enabling third-party tracking.

## Project recommendation

1. Start with GA4 first for baseline funnel reporting.
2. Add Meta/TikTok only in markets where paid campaigns run.
3. Add GTM only if custom tags or server-side tracking are needed.
