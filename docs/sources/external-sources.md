# External Evidence by Claim

This file maps each external source to the claim it verifies.
Use links inline in the owning docs when that claim is written.

## Web App and PWA
- Service workers enable background caching/offline behavior for web apps ([MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)).
- Progressive Web App fundamentals and installability model are browser-native ([MDN PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)).
- WordPress custom content types use `register_post_type` ([WP reference](https://developer.wordpress.org/reference/functions/register_post_type/)).
- WordPress custom metadata updates use `update_post_meta` ([WP reference](https://developer.wordpress.org/reference/functions/update_post_meta/)).
- WordPress allows injecting scripts/markup in `<head>` via `wp_head` ([WP reference](https://developer.wordpress.org/reference/hooks/wp_head/)).
- WordPress has PWA plugins if plugin-led implementation is chosen ([WordPress plugin directory](https://wordpress.org/plugins/pwa/)).

## Forms, CRM, and Messaging
- Gravity Forms supports configurable notification routing ([GF notifications](https://docs.gravityforms.com/configuring-notifications-in-gravity-forms/)).
- Gravity Forms supports conditional notification logic ([GF conditional notifications](https://docs.gravityforms.com/enable-conditional-logic-for-notifications/)).
- Gravity Forms supports conditional logic at form level ([GF conditional logic](https://docs.gravityforms.com/enable-conditional-logic/)).
- Klaviyo supports profile properties for segmentation ([Klaviyo profiles](https://help.klaviyo.com/hc/en-us/articles/115002779411)).
- Klaviyo supports triggered and flow-driven messaging ([Klaviyo flows](https://help.klaviyo.com/hc/en-us/articles/360032334511)).

## PATCH Integration and Loyalty
- PATCH supports abandoned cart automation with ROLLER context ([PATCH guide](https://help.patchretention.com/how-to-set-up-the-roller-abandoned-cart-automation)).
- PATCH has a documented ROLLER integration setup flow ([PATCH setup](https://help.patchretention.com/how-to-setup-the-patch-roller-integration)).
- PATCH loyalty widget installation exists as standard embedding path ([PATCH widget install](https://help.patchretention.com/installing-the-rewards-widget)).
- PATCH rewards widget exposes loyalty/reward status to customers ([PATCH rewards widget](https://help.patchretention.com/loyalty-program-rewards-widget)).
- PATCH documents mapped data fields from ROLLER ([PATCH mapped fields](https://help.patchretention.com/what-data-fields-are-mapped-from-roller-to-patch)).
- PATCH contact-level fields can store custom loyalty values ([PATCH contact fields](https://help.patchretention.com/account-settings-fields-contact-level)).
- PATCH contacts endpoint exists for contact retrieval/update operations ([PATCH contacts API](https://api.patchretention.com/v2/contacts)).
- PATCH markets a loyalty platform with reward logic support ([PATCH loyalty page](https://patchretention.com/loyalty-rewards)).
- PATCH publishes case-study evidence of platform usage in venue contexts ([PATCH case study](https://patchretention.com/blog/x-golf-case-study-patch-offers-everything-we-need-in-one-platform)).

## ROLLER Integration, API, and Webhooks
- ROLLER and PATCH are listed as integration partners ([ROLLER partner page](https://www.roller.software/integrations/partner/patch-retention)).
- ROLLER API capability is documented at platform level ([ROLLER API overview](https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview)).
- ROLLER Data API capability is documented ([ROLLER Data API](https://mysupport.roller.software/hc/en-us/articles/360001653475-Data-API)).
- ROLLER documents API usage limits and excess-call handling ([ROLLER API limits](https://mysupport.roller.software/hc/en-us/articles/4410780591759-Manage-API-excess-call-usage)).
- ROLLER provides a sandbox/playground environment for API testing ([ROLLER Playground](https://mysupport.roller.software/hc/en-us/articles/360000298275-ROLLER-Playground)).
- ROLLER and PATCH integration behavior is described in support docs ([ROLLER-PATCH support](https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention)).

## ROLLER Checkout, Booking, and Pricing
- ROLLER online checkout can be created and configured ([create checkout](https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout)).
- ROLLER checkout can be shared as hosted link/embed target ([share checkout](https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout)).
- Overlay checkout embedding is supported ([overlay checkout](https://mysupport.roller.software/hc/en-us/articles/9657999631759-Add-the-overlay-checkout-experience-to-your-website)).
- Full-page checkout embedding is supported ([full-page checkout](https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages)).
- Progressive checkout supports conversion tracking ([progressive checkout tracking](https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts)).
- Booking creation/management exists in Venue Manager ([bookings in Venue Manager](https://mysupport.roller.software/hc/en-us/articles/360000086056-Create-and-manage-bookings-from-Venue-Manager)).
- Booking reporting is available ([bookings report](https://mysupport.roller.software/hc/en-us/articles/115001724674-Bookings-report)).
- Product categories are a first-class setup step ([product categories](https://mysupport.roller.software/hc/en-us/articles/360000181395-Create-your-product-categories)).
- Package products and bundled pricing are supported ([packages](https://mysupport.roller.software/hc/en-us/articles/360000624195-Create-your-package-products), [bundle discounts](https://mysupport.roller.software/hc/en-us/articles/360000623875-Sell-bundled-products-at-discounted-rates-with-packages)).
- Party package products are supported as a product type ([party packages](https://mysupport.roller.software/hc/en-us/articles/5819701100943-Create-your-party-package-products)).
- Price rules are supported for discount/rule logic ([price rules](https://mysupport.roller.software/hc/en-us/articles/11149309350671-Get-started-with-price-rules), [time-based rules](https://mysupport.roller.software/hc/en-us/articles/11149328433935-Create-time-based-price-rules)).
- Checkout can be configured to allow booking without immediate payment ([book without paying](https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying)).

## ROLLER Memberships, Waivers, and Guest Operations
- ROLLER has membership feature set and documentation section ([memberships section](https://mysupport.roller.software/hc/en-us/sections/5460757524239-Memberships)).
- Membership redemption at POS (point of sale) is supported ([redeem memberships](https://mysupport.roller.software/hc/en-us/articles/360001465135-Redeem-memberships-at-POS)).
- Membership card printing at POS is supported ([print membership cards](https://mysupport.roller.software/hc/en-us/articles/12886953128207-Print-membership-cards-at-POS)).
- Custom membership IDs at POS are supported ([custom membership ID](https://mysupport.roller.software/hc/en-us/articles/13606318921359-Enter-a-custom-ID-for-a-membership-at-POS)).
- Member-benefit verification at POS is supported ([verify member benefits](https://mysupport.roller.software/hc/en-us/articles/14224927658639-Verify-member-benefits-at-POS)).
- Waiver setup and online collection are supported ([online waivers](https://mysupport.roller.software/hc/en-us/articles/10367792689935-Get-started-with-online-waivers), [get waivers signed](https://mysupport.roller.software/hc/en-us/articles/115001692473-Get-waivers-signed-by-guests)).
- Waiver status can be viewed/sent in mobile check-in app ([mobile waiver handling](https://mysupport.roller.software/hc/en-us/articles/10507797711631-View-and-send-waivers-in-the-Mobile-Check-in-app)).
- Waiver lookup at POS is supported ([search waivers at POS](https://mysupport.roller.software/hc/en-us/articles/360000069755-Search-for-waivers-at-POS)).
- Waiver QR code based arrival flow is supported ([waiver QR sign](https://mysupport.roller.software/hc/en-us/articles/15193945294479-Create-a-waiver-QR-code-sign-for-fast-check-ins), [arrival flow QR](https://mysupport.roller.software/hc/en-us/articles/360001569556-Improve-your-guest-arrival-flow-with-QR-codes-for-waiver-completion)).
- ROLLER publishes QR-code operations guidance ([ROLLER QR blog](https://www.roller.software/blog/how-to-use-qr-codes-to-streamline-your-venue)).

## ROLLER HQ and Multi-Venue
- HQ setup and multi-venue control are supported ([get started with HQ](https://mysupport.roller.software/hc/en-us/articles/13574818583823-Get-started-with-HQ)).
- HQ schedules can be created and managed centrally ([HQ schedules](https://mysupport.roller.software/hc/en-us/articles/7014164748943-Create-and-manage-HQ-schedules)).
- HQ checkout can be created and managed ([HQ checkouts](https://mysupport.roller.software/hc/en-us/articles/9681919703567-Create-and-manage-HQ-checkouts)).
- HQ product sharing/managing across venues is supported ([HQ products managed venues](https://mysupport.roller.software/hc/en-us/articles/4410621801999-Create-and-add-HQ-products-to-managed-venues), [HQ products share](https://mysupport.roller.software/hc/en-us/articles/4410621801999-Create-and-share-HQ-products)).
- Multi-venue gift card redemption can be enabled on request ([HQ gift card redemption](https://mysupport.roller.software/hc/en-us/articles/13546297703055-HQ-multi-venue-gift-card-redemption-on-request)).

## ROLLER Payments, Email, Branding, and Account
- ROLLER Payments setup and method enablement are documented ([payments setup](https://mysupport.roller.software/hc/en-us/articles/360002185856-Get-started-with-ROLLER-Payments), [add payment methods](https://mysupport.roller.software/hc/en-us/articles/360001841316-Add-online-payment-methods-with-ROLLER-Payments)).
- Brand assets and venue settings are configurable ([brand assets](https://mysupport.roller.software/hc/en-us/articles/115001738913-Add-your-brand-logos-images-and-colors), [venue settings](https://mysupport.roller.software/hc/en-us/articles/115001738953-Add-your-key-venue-settings)).
- Email templates and booking-notification emails are configurable ([email templates](https://mysupport.roller.software/hc/en-us/articles/360000577896-Customize-your-email-templates), [new booking emails](https://mysupport.roller.software/hc/en-us/articles/360000577916-Receive-emails-for-new-bookings), [suppress generated emails](https://mysupport.roller.software/hc/en-us/articles/14394483835535-Enable-or-suppress-specific-ROLLER-generated-emails)).
- Online account sign-in behavior exists in ROLLER products ([online accounts](https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts)).
- Operating hours management is supported in product configuration ([operating hours](https://mysupport.roller.software/hc/en-us/articles/6670697201551-Set-up-and-manage-operating-hours)).
- Product update notes are published and can affect implementation assumptions ([product updates](https://mysupport.roller.software/hc/en-us/articles/14350368795663-November-2025-product-updates)).
- This support article ID is kept as a previously cited operational reference pending exact topic remap ([support article 12965544901647](https://mysupport.roller.software/hc/en-us/articles/12965544901647)).

## Marketing and Third-Party Integrations
- ROLLER lists Campaign Monitor as an integration partner ([Campaign Monitor integration](https://www.roller.software/integrations/partner/campaign-monitor)).
- ROLLER lists Klaviyo as an integration partner ([Klaviyo integration](https://www.roller.software/integrations/partner/klaviyo)).
- Google Analytics supports conversion and event tracking configuration for web properties ([GA setup](https://support.google.com/analytics/answer/10071301), [GA consent/config references](https://support.google.com/analytics/answer/9976101)).
- Checkout tracking consent can be requested from guests ([checkout consent](https://mysupport.roller.software/hc/en-us/articles/7835988980751-Request-guest-cookie-consent-before-tracking-checkout-activity)).

## Website Integrations and Commerce
- Shopify Buy Button embed exists for external-site checkout embedding ([Shopify buy button](https://help.shopify.com/en/manual/online-sales-channels/buy-button/add-embed-code)).
- WooCommerce product creation model is standard WordPress commerce baseline ([WooCommerce products](https://woocommerce.com/document/managing-products/add-product/)).
- Mobal supports opening-hours setup and embeddable website widget ([Mobal opening hours](https://support.mobal.io/en/articles/134410-how-to-set-up-opening-hours-and-special-opening-hours-on-mobal), [Mobal widget](https://support.mobal.io/en/articles/292005-how-to-get-started-with-the-website-widget-for-opening-hours-on-mobal)).

## Legal and Security
- GDPR legal obligations are defined in Regulation (EU) 2016/679 ([GDPR text](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)).
- EDPB (European Data Protection Board) guidance clarifies GDPR territorial scope ([EDPB guidance](https://www.edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-32018-territorial-scope-gdpr-article-3-version_nb)).
- NIST OTP/authenticator security guidance is defined in SP 800-63B ([NIST SP 800-63B](https://pages.nist.gov/800-63-4/sp800-63b.html)).
