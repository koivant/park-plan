PATCH

- Which PATCH REST endpoint should we use to read loyalty points/stamps for one customer, and what are the exact field names?
- Does PATCH provide loyalty update webhooks? If yes, which events should we subscribe to?
- Can we change loyalty points/stamps through PATCH REST API, or only through PATCH automation rules?
- Are progression, reset, and reward validity rules fully managed in PATCH settings?
- What are PATCH API rate limits and call-based costs?
- Do we need one PATCH account per park, or one shared account for multiple parks?
- Are loyalty points tied to one park or usable across parks?
- What is the correct key to match a ROLLER customer to a PATCH contact?
- Can PATCH loyalty status and reward output be shown inside native ROLLER customer account view?

ROLLER

- For our OTP-based app login, which ROLLER endpoints are required for read-only account view (profile, bookings, waivers)?
- If webhook delivery fails or an event is missed, which ROLLER API endpoints should we call to recover the missing customer booking/waiver data?
- What is the stable ROLLER customer identifier we should store for PATCH mapping?
- Can customer profile data be updated through ROLLER API, and which fields are allowed?
