# Checkout (Flow)

Last updated: 2026-03-06

Q: Should we use ROLLER hosted checkout, and how does that flow work?
A:
1. Visitor opens a WordPress page.
2. Visitor browses park content and sees ticket call-to-actions.
3. Visitor clicks Buy tickets.
4. ROLLER checkout opens (overlay or full-page).
5. Visitor sees available products in ROLLER ticket catalog and selects items.
6. Visitor pays in ROLLER.
7. ROLLER handles booking confirmation.

Q: How is product inventory shown in the flow?
A:
1. Inventory and availability are rendered by ROLLER checkout UI.
2. WordPress drives users to that catalog via Buy tickets links.
3. No custom checkout build is needed for this flow.

Q: Can we show live ticket inventory inside WordPress pages?
A: Not with this no-custom approach. That would require custom integration.

Q: How would "select online, pay in venue" work if allowed?
A:
1. Visitor chooses products online.
2. Visitor completes payment at the venue.
3. Use only if ROLLER confirms this is supported in progressive overlay for this account.

Q: How can QR codes be used throughout park services and ticket purchase?
A:
1. Parking lot: guest scans QR before entering the park to start ticket or waiver steps.
2. Entrance queue: guest scans QR to complete waiver and reduce manual processing.
3. Ticket purchase points: guest scans QR to open checkout and buy tickets on phone.
4. Entry desk: staff scans guest confirmation QR for faster validation.
5. In-park service areas: guest scans table/service QR for self-service orders where enabled.
