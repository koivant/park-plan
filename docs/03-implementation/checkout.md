# Checkout (Implementation)

Last updated: 2026-03-06

## Selected implementation

1. Use ROLLER hosted overlay checkout.
2. WordPress park pages open ROLLER ticket catalog via Buy tickets buttons.

## Technical steps

1. Configure products, pricing, and availability in ROLLER.
2. Create and validate park-specific checkout links in ROLLER.
3. Build reusable WordPress CTA component for Buy tickets.
4. Map each park page to correct checkout link.
5. Add required URL campaign tags (`utm_source`, `utm_medium`, `utm_campaign`).
6. Enable and test checkout tracking events.
7. Validate end-to-end journey: park page -> checkout -> purchase confirmation.
8. Create QR destination map by service point (parking, entrance, ticket desk, in-park services).
9. Create QR signage assets and place them in each service point.
10. Add clear call-to-action text on signage (for example: `Scan here to buy tickets` or `Scan here to sign waiver`).
11. Link each QR to correct destination (waiver, checkout, service order page, or info page).
12. Add campaign tags to QR destinations for measurement.
13. Test full on-site flow with guest phones and staff scanners.

## Data and ownership

1. Product catalog and availability source: ROLLER.
2. Checkout UI source: ROLLER.
3. Content and ticket entry points: WordPress.

## To investigate

1. Does this account support pay-in-venue in progressive overlay checkout?
2. Which ROLLER plan tier and add-ons are needed for full tracking setup (for example GTM access, paid media pixels, and any required integration/API access)?
3. Is online waiver + QR arrival flow enabled for this account and operating model?
4. Which park services can use QR self-service in current stack (ticketing, waiver, entry validation, F&B ordering)?
