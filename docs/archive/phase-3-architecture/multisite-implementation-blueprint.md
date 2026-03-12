# WordPress Multisite Blueprint (Planning)

Last updated: 2026-03-03

## Goal

Use one platform that works for many countries and many parks, while keeping local teams fast.

## Locked checkout choice

1. Tickets are sold through **ROLLER overlay checkout**.
2. WordPress pages send users to that overlay flow.

## Suggested site structure

1. One WordPress multisite network.
2. One site per park (recommended for franchise control).
3. Optional country hub sites for shared campaigns.

## Roles

1. **HQ super admin**
   - Controls plugins, themes, security, and integration settings.
2. **Country manager**
   - Controls country campaigns and translations.
3. **Park admin**
   - Updates local pages, schedules, events, and offers.

## Integration responsibilities

## WordPress side

1. Content pages and local marketing.
2. Overlay checkout launch buttons/links.
3. "My account" links.

## ROLLER side

1. Checkout, payment, account, and loyalty logic.
2. Booking and membership data.

## Build phases

1. **Phase A**
   - Overlay checkout rollout and core content templates.
2. **Phase B**
   - Webhook/reporting setup and shared customer profile approach.
3. **Phase C**
   - Loyalty optimization and country-level tuning.

## References

1. https://developer.wordpress.org/advanced-administration/multisite/
2. https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website
