# Checkout Q&A

Last updated: 2026-03-25

Q: Should we create a custom checkout flow?
A: For current scope, no. ROLLER hosted checkout already supports the needed web flow (overlay/full-page and direct links to product sections/products). Build custom checkout only if you need behavior that hosted checkout cannot provide.
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website

Q: Should we use ROLLER's hosted checkout option? Which one?
A: Yes. We should use ROLLER hosted checkout in overlay mode.
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout

Q: Is ROLLER Payments required for progressive checkout?
A: Yes. Progressive checkouts (overlay and full-page) require ROLLER Payments.
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout

Q: How is product inventory presented in the user interface?
A: Without custom build, product catalog is presented in ROLLER checkout UI. From the park site, the Buy tickets button opens that catalog (overlay or full-page checkout).
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout

Q: How are opening hours managed on the website?
A: In ROLLER, each park (managed venue) maintains its own operating hours. HQ schedules then use park-level operating hours. For website display in WordPress, no native ROLLER->WordPress hours sync is documented in public docs, so website display must be handled through an integration path.
Source: https://mysupport.roller.software/hc/en-us/articles/6670697201551-Set-up-and-manage-operating-hours
Source: https://mysupport.roller.software/hc/en-us/articles/7014164748943-Create-and-manage-HQ-schedules
Source: ../sources/internal-evidence.md#ie-002-owner-comments-on-hours-product-cards-forms-2026-03-17

Q: What data exactly is hosted in ROLLER?
A: Core operating data is hosted in ROLLER: products, pricing, schedules, bookings, guest records, waiver records, and membership-related data. ROLLER also has payment and checkout data in its checkout and payments stack.
Source: https://mysupport.roller.software/hc/en-us/articles/360001653475-Data-API
Source: https://mysupport.roller.software/hc/en-us/articles/4410621801999-Create-and-add-HQ-products-to-managed-venues
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/360002185856-Get-started-with-ROLLER-Payments

Q: How can we get ROLLER data to our website?
A: Two paths are documented. 1) Use ROLLER hosted checkout links (overlay/full-page) for buying flow. 2) Use API integration when you need data outside checkout UI (for example custom website components).
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview

Q: How are product names and prices managed for product cards?
A: Product-related website data is sourced from ROLLER. In checkout UI this is native ROLLER behavior. If product cards are rendered in WordPress pages, they must be fed by ROLLER data integration.
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/4410621801999-Create-and-share-HQ-products
Source: ../sources/internal-evidence.md#ie-002-owner-comments-on-hours-product-cards-forms-2026-03-17

Q: Is ROLLER data global or can each park customize it?
A: Both. HQ can centralize and publish shared setup (for example products, schedules, checkouts), and each managed park can still handle local setup fields (for example operating hours and some local settings).
Source: https://mysupport.roller.software/hc/en-us/articles/13574818583823-Get-started-with-HQ
Source: https://mysupport.roller.software/hc/en-us/articles/4410621801999-Create-and-add-HQ-products-to-managed-venues
Source: https://mysupport.roller.software/hc/en-us/articles/9681919703567-Create-and-manage-HQ-checkouts
Source: https://mysupport.roller.software/hc/en-us/articles/7014164748943-Create-and-manage-HQ-schedules

Q: Can one ROLLER setup manage multiple parks with different products, pricing, and currencies?
A: Yes, using HQ + managed venues. Products and pricing can be managed at HQ and shared to venues. Multi-venue groups can include different currencies, but some HQ features may require matching currency between selected venues.
Source: https://mysupport.roller.software/hc/en-us/articles/9681919703567-Create-and-manage-HQ-checkouts
Source: https://mysupport.roller.software/hc/en-us/articles/4410621801999-Create-and-share-HQ-products
Source: https://mysupport.roller.software/hc/en-us/articles/11149309350671-Get-started-with-price-rules
Source: https://mysupport.roller.software/hc/en-us/articles/13546297703055-HQ-multi-venue-gift-card-redemption-on-request

Q: Do products and checkout support different currencies?
A: Yes at venue level. ROLLER supports region-based payment methods and venue currency setup. In multi-venue use, some cross-venue features require same currency between selected venues.
Source: https://mysupport.roller.software/hc/en-us/articles/360001841316-Add-online-payment-methods-with-ROLLER-Payments
Source: https://mysupport.roller.software/hc/en-us/articles/13546297703055-HQ-multi-venue-gift-card-redemption-on-request

Q: What ROLLER plan/add-ons are needed for many parks and countries?
A: Based on public docs: 1) HQ add-on for central multi-park management, 2) ROLLER Payments for progressive checkout and online accounts, and 3) API add-on if you need external integrations (including Patch).
Source: https://mysupport.roller.software/hc/en-us/articles/13574818583823-Get-started-with-HQ
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention

Q: When using ROLLER checkout UI, how much is it possible to customise the UI? Can we add branding, custom themes, colours, etc.?
A: Yes, to a degree. You can customize branding elements such as logo, background image, button/text colors, and checkout appearance settings. Full component-level redesign is verification needed.
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/115001738913-Add-your-brand-logos-images-and-colors

Q: Can the park site show products and then send users to ticket catalog without custom solutions?
A: Yes. This is supported by ROLLER hosted checkout. If we want live inventory fully rendered inside WordPress itself, that would require custom integration.
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages

Q: Is "select online, pay in venue" checkout option possible and offered by ROLLER?
A: Public docs are inconsistent. One article says "pay later" is legacy checkout only, while another progressive-checkout payment article still mentions the same setting. Final status for overlay checkout is verification needed from ROLLER support.
Source: https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying
Source: https://mysupport.roller.software/hc/en-us/articles/360001841316-Add-online-payment-methods-with-ROLLER-Payments

Q: Can we categorise products in ROLLER checkout by featured items or some other rules?
A: Yes. You can group products with sections, categories and tags. You can also highlight products with homepage widgets (for example carousels). Fully automatic featured ranking is research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/12965544901647
Source: https://mysupport.roller.software/hc/en-us/articles/360000181395-Create-your-product-categories
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout

Q: Is it possible to create value packs in ROLLER?
A: Yes. Use Package products (and Party package products for party use cases) to bundle multiple products into one sellable value pack with package pricing.
Source: https://mysupport.roller.software/hc/en-us/articles/360000623875-Sell-bundled-products-at-discounted-rates-with-packages
Source: https://mysupport.roller.software/hc/en-us/articles/360000624195-Create-your-package-products
Source: https://mysupport.roller.software/hc/en-us/articles/5819701100943-Create-your-party-package-products

Q: What payment options are there?
A: Payment methods depend on your ROLLER Payments setup and region. You can configure available methods in Venue Manager. "Pay later" (book now, pay later) is documented for legacy checkout.
Source: https://mysupport.roller.software/hc/en-us/articles/360001841316-Add-online-payment-methods-with-ROLLER-Payments
Source: https://mysupport.roller.software/hc/en-us/articles/360002185856-Get-started-with-ROLLER-Payments
Source: https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying

Q: How can QR codes be used throughout park services and ticket purchase?
A:
1. Entry and waiting areas: QR to waiver and ticket checkout.
2. Parking lot: QR to pre-arrival ticket purchase or waiver completion.
3. In-park services: QR for table-side food and beverage ordering.
4. Entry validation: guest purchase confirmation QR can be scanned at entry.
Source: https://mysupport.roller.software/hc/en-us/articles/360001569556-Improve-your-guest-arrival-flow-with-QR-codes-for-waiver-completion
Source: https://www.roller.software/blog/how-to-use-qr-codes-to-streamline-your-venue

Q: How should waiver be processed? How to make it as easy as possible for guest to fill it and submit online or at POS?
A:
1. Use online waivers as the default. Attach waivers to products that need them so guests are prompted right after online purchase.
2. Add waiver links to confirmation/reminder messaging and to a clear `Sign waiver` button on the website.
3. At venue, use QR signs (queue/entrance/parking) so guests can sign on their own phone before reaching POS.
4. Keep a waiver kiosk as backup for guests without a usable phone.
5. At POS, if waiver is missing, staff sends a waiver request by SMS or email from the booking, then continues check-in after completion.
6. At POS, staff can search/assign waivers by name, email, phone, or date of birth to avoid manual paper handling.
7. Note: digital waivers are an add-on feature in ROLLER.
Source: https://mysupport.roller.software/hc/en-us/articles/115001692473-Get-waivers-signed-by-guests
Source: https://mysupport.roller.software/hc/en-us/articles/10367792689935-Get-started-with-online-waivers
Source: https://mysupport.roller.software/hc/en-us/articles/15193945294479-Create-a-waiver-QR-code-sign-for-fast-check-ins
Source: https://mysupport.roller.software/hc/en-us/articles/360000069755-Search-for-waivers-at-POS
Source: https://mysupport.roller.software/hc/en-us/articles/10507797711631-View-and-send-waivers-in-the-Mobile-Check-in-app

Q: How customizable do park forms need to be?
A: Required scope from owner feedback: conditional field visibility, park-specific products/prices (for example birthday forms), and park-specific notification templates for customer and staff emails. Per-park email differences are supported in ROLLER through venue-level email template and notification settings.
Source: ../sources/internal-evidence.md#ie-002-owner-comments-on-hours-product-cards-forms-2026-03-17
Source: https://mysupport.roller.software/hc/en-us/articles/360000577896-Customize-your-email-templates
Source: https://mysupport.roller.software/hc/en-us/articles/14394483835535-Enable-or-suppress-specific-ROLLER-generated-emails
Source: https://mysupport.roller.software/hc/en-us/articles/115001738953-Add-your-key-venue-settings
Source: https://mysupport.roller.software/hc/en-us/articles/360000577916-Receive-emails-for-new-bookings

Q: Can customer and staff notification emails be different per park?
A: Yes. Email templates and booking-notification addresses are venue-level settings, so each park can have different customer and staff emails even in an HQ model.
Source: https://mysupport.roller.software/hc/en-us/articles/360000577896-Customize-your-email-templates
Source: https://mysupport.roller.software/hc/en-us/articles/14394483835535-Enable-or-suppress-specific-ROLLER-generated-emails
Source: https://mysupport.roller.software/hc/en-us/articles/115001738953-Add-your-key-venue-settings
Source: https://mysupport.roller.software/hc/en-us/articles/360000577916-Receive-emails-for-new-bookings

Q: For non-ROLLER countries (for example Finland, Philippines, Saudi Arabia, and Malaysia), what is the opening-hours fallback?
A: Use a non-ROLLER website hours layer. Preferred path: Mobal Opening Hours Widget (auto-sync from Mobal profile, including special hours). Fallback path: manual park-level hours in WordPress content fields and manual updates for exceptions.
Source: ../sources/internal-evidence.md#ie-002-owner-comments-on-hours-product-cards-forms-2026-03-17
Source: https://support.mobal.io/en/articles/292005-how-to-get-started-with-the-website-widget-for-opening-hours-on-mobal
Source: https://support.mobal.io/en/articles/134410-how-to-set-up-opening-hours-and-special-opening-hours-on-mobal
Source: https://developer.wordpress.org/reference/hooks/wp_head/
Source: https://developer.wordpress.org/reference/functions/update_post_meta/

Q: For non-ROLLER countries, what is the mandatory forms fallback with conditional fields and customer/staff notifications?
A: Use Gravity Forms as the non-ROLLER baseline in WordPress. It supports field-level conditional logic, notification configuration, and conditional notification logic, so customer/staff email flows can stay independent from ROLLER.
Source: ../sources/internal-evidence.md#ie-002-owner-comments-on-hours-product-cards-forms-2026-03-17
Source: https://docs.gravityforms.com/enable-conditional-logic/
Source: https://docs.gravityforms.com/configuring-notifications-in-gravity-forms/
Source: https://docs.gravityforms.com/enable-conditional-logic-for-notifications/

Q: Should product cards and value packs also have a manual mode for campaigns and non-ROLLER countries?
A: Yes. Keep a manual CMS-managed mode as a baseline, then optionally connect cards to commerce systems where available (ROLLER API, WooCommerce products, or Shopify Buy Button embed) per country.
Source: ../sources/internal-evidence.md#ie-002-owner-comments-on-hours-product-cards-forms-2026-03-17
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview
Source: https://woocommerce.com/document/managing-products/add-product/
Source: https://help.shopify.com/en/manual/online-sales-channels/buy-button/add-embed-code
Source: https://developer.wordpress.org/reference/functions/register_post_type/
