# Loyalty App System Diagrams

These diagrams describe the complete loyalty app system, including ROLLER checkout webhooks, PATCH integrations, and the logged-in customer web view.

## Customer Web View
- Shows customer name and contact details from the app account projection.
- Shows loyalty stamp count and available rewards from PATCH-derived loyalty state.
- Shows upcoming bookings from ROLLER booking webhook data.
- Shows waiver status and, where permitted, a waiver document link or stored document reference from ROLLER waiver data.

## Diagrams
- Customer journey and access paths: [`customer-journeys.mmd`](./diagrams/customer-journeys.mmd)
- Loyalty data flow, including customer profile, booking, ticket, waiver, loyalty stamp, discount code, redemption, and usage verification data: [`data-flow.mmd`](./diagrams/data-flow.mmd)
- Infrastructure and service connections: [`infrastructure.mmd`](./diagrams/infrastructure.mmd)
