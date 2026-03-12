# Checkout (Concept)

Last updated: 2026-03-11

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

Q: When using ROLLER checkout UI, how much is it possible to customise the UI? Can we add branding, custom themes, colours, etc.?
A: Yes, to a degree. You can customize branding elements such as logo, background image, button/text colors, and checkout appearance settings. Full component-level redesign is verification needed.
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/115001738913-Add-your-brand-logos-images-and-colors

Q: Can the park site show products and then send users to ticket catalog without custom solutions?
A: Yes. This is supported by ROLLER hosted checkout. If we want live inventory fully rendered inside WordPress itself, that would require custom integration.
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout
Source: https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages

Q: Is "select online, pay in venue" checkout option possible and offered by ROLLER?
A: ROLLER documents this for legacy checkout ("pay later"). For progressive overlay checkout, research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/6052170934543-Allow-your-guests-to-book-online-without-paying

Q: Can we categorise products in ROLLER checkout by featured items or some other rules?
A: Yes. You can group products with sections, categories and tags. You can also highlight products with homepage widgets (for example carousels). Fully automatic featured ranking is research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/12965544901647
Source: https://mysupport.roller.software/hc/en-us/articles/360000181395-Create-your-product-categories
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout

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
