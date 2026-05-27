# Use Cases

## 1. As a customer I can join the loyal program by clicking the e-mail link that I received after my first visit to SuperPark (if I haven’t already joined in the checkout on the webpage, or on site).

### Flow explanation from customers perspective

- Customer visits SuperPark and can opt in to the loyalty program during ROLLER web checkout or click a join link on the SuperPark website.
- If the customer opts in during ROLLER checkout, they are onboarded automatically.
- If the customer did not already join, PATCH sends an email invitation 1 day after the booked visit date.
- Customer clicks the email link and opens the Loyalty App join form.
- Customer enters or confirms name, email, phone, and marketing consent.
- If the email is already registered, the flow avoids creating a duplicate account and guides the customer to the login page.
- If the email is not registered, the loyalty profile is created and the customer gets a confirmation.
- Customer verifies email ownership and can then use the Loyalty PWA through the normal email magic-link login flow.

### Flow explanation from data point of view

- ROLLER booking data is the source for visit, country, and park context.
- The loyalty profile is global across parks and countries and is unique by email.
- If the customer opts in during checkout, the opt-in flag is included in the ROLLER booking webhook data that reaches PATCH.
- PATCH calls the Loyalty App with checkout payload data that includes the opt-in state.
- For customers who did not already opt in, PATCH sends the post-visit join invitation 1 day after the booked visit date.
- The join email points to a global Loyalty App join form, not a customer-specific token link.
- Join submission normalizes customer identity data.
- The app checks for an existing customer by email before creating a pending customer profile.
- If a matching email exists, the app reuses that customer profile instead of creating a duplicate.
- The app stores the customer profile, pending or active loyalty state, country, and park context in PostgreSQL.
- Marketing consent is captured on the join form and can later be changed in PWA profile settings.
- Later PATCH loyalty updates can add stamp state and reward-code data to the same customer profile.

### Open questions

- What exact ROLLER/PATCH payload field carries checkout loyalty opt-in to the Loyalty App?
- What exact PATCH payload should the Loyalty App receive when PATCH onboards an opted-in checkout customer?
- What exact email verification state transition changes a pending customer into an active loyalty member?
- Where should marketing consent and later PWA profile-setting changes be stored?
- What exact booking fields should be treated as source of truth for country and park details?

### Systems involved

- Customer email inbox
- SuperPark website
- Loyalty PWA
- Loyalty App API
- PostgreSQL app database
- ROLLER
- PATCH

## 2. As a Loyalty program member I can log in to the Loyalty program web app using a magic link on e-mail.

### Flow explanation from customers perspective

- Loyalty member opens the Loyalty PWA login page.
- Member enters the email address used for their loyalty profile.
- The app confirms that a login email will be sent if the account exists.
- Member receives a magic-link email sent by PATCH.
- Member clicks the magic link.
- If the link is valid and not expired, the member is logged in.
- If the profile was pending or unverified, the same successful magic-link login verifies the email.
- The Loyalty PWA opens the member account view.
- Member can see their profile, stamps, bookings, tickets, waiver status, parks, and rewards.
- If the link is expired or already used, the member must request a new magic link.

### Flow explanation from data point of view

- Email is the global account key for loyalty profiles.
- The Loyalty App normalizes the submitted email.
- The API looks up a customer profile by normalized email.
- If no profile exists, the API returns a neutral response and does not reveal whether the email is registered.
- If a profile exists and is eligible for login, the API creates a one-time magic-link token.
- The token is stored hashed in PostgreSQL with expiry and unused state.
- Production magic-link tokens expire after 1 hour.
- Login requests are rate-limited to one request every 3 seconds.
- The plain token is sent to the member by PATCH as a login link.
- When the member opens the link, the API hashes the received token and checks that it exists, is unused, and has not expired.
- On success, the token is marked consumed.
- On first successful login for a pending or unverified profile, the app marks the email as verified.
- The app creates a session for the customer profile.
- Production sessions should be persisted in PostgreSQL and expire automatically after 1 week.
- The PWA reads the customer account projection from the Loyalty App API using the authenticated customer id from the session.
- The account projection is loaded from PostgreSQL, not directly from ROLLER or PATCH during page load.

### Open questions

- What exact PATCH email mechanism and payload should be used to send the dynamic magic-link token?
- Should the 3-second login request limit apply per email, per IP address, or both?
- What exact PostgreSQL session schema should be used for production sessions?

### Systems involved

- Loyalty PWA
- Loyalty App API
- PostgreSQL app database
- PATCH
- Customer email inbox

## 3. As a Loyalty program member, I accumulate a stamp for each admission ticket I purchase.

### Flow explanation from customers perspective

- Loyalty member buys one or more admission tickets through ROLLER checkout.
- The purchase is confirmed in the normal SuperPark purchase flow.
- The member does not need to manually claim stamps.
- After the purchase or booking is processed, the member's stamp count is updated.
- Member can log in to the Loyalty PWA and see the updated stamp count.
- If the booking is canceled or refunded, the related stamps are canceled according to the loyalty rules.
- No-shows and booking moves do not cancel stamps.

### Flow explanation from data point of view

- ROLLER booking data is the source for booking, ticket quantity, park, country, booking date, and booking status.
- ROLLER sends booking data to PATCH through the configured ROLLER/PATCH integration.
- PATCH sends booking data to the Loyalty App through automation.
- The Loyalty App owns stamp calculation for the loyalty program.
- Stamps are awarded when the booking is purchased.
- Each eligible admission ticket gives one stamp.
- The owner of the purchase receives all stamps for the booking, regardless of ticket type or whether tickets are for adults, children, or other guests.
- The Loyalty App calculates stamp changes from eligible admission ticket quantity.
- The Loyalty App maintains a stamp grid ledger in PostgreSQL.
- Stamp collections define the target stamp count and reward items for predefined stamp counts.
- Rewards are tiered, for example a 10th stamp can reward a discount code and a 5th stamp can unlock another reward tier such as beverages or events.
- Individual stamp records store who collected the stamp and which stamp collection the stamp belongs to.
- ROLLER booking webhooks also store the booking and ticket projection in PostgreSQL for customer display and reconciliation.
- The Loyalty PWA reads the current stamp count from the Loyalty App account projection, not directly from PATCH or ROLLER.
- If a booking is canceled or refunded, ROLLER and PATCH send updated events and the Loyalty App cancels the related stamps.
- Booking moves and no-shows do not change the stamp count.
- Partial refunds are not supported.

### Open questions

- Which ROLLER ticket or product types count as eligible admission tickets?
- What exact PATCH automation payload should carry booking data to the Loyalty App for stamp calculation?
- What exact PostgreSQL schema should be used for stamp collections, stamps, and tiered rewards?
- How should canceled stamps be represented in the ledger?

### Systems involved

- ROLLER checkout
- ROLLER
- PATCH
- Loyalty App API
- PostgreSQL app database
- Loyalty PWA

## 4. As a Loyalty member, I can view my loyalty status in the web app and see the number of stamps I have.

### Flow explanation from customers perspective

- Loyalty member logs in to the Loyalty PWA with a magic link.
- Member opens the account or loyalty status view.
- Member sees the current number of collected stamps.
- Member sees the current stamp collection target.
- Member sees progress toward the next reward tier.
- Member sees all rewards up to the 10th stamp.
- Member sees collected rewards and current unused or collectable rewards.
- Member sees reward and discount codes in the separate rewards view.
- If recent purchases, cancellations, or refunds changed the stamp count, the view shows the latest calculated state after the Loyalty App has processed the related events and the member manually refreshes the view.
- If a customer buys a ticket that earns a stamp and unlocks a reward, then cancels the ticket, the reward must be canceled too.

### Flow explanation from data point of view

- The PWA uses the authenticated session and customer id to request the account projection from the Loyalty App API.
- The Loyalty App reads the customer's loyalty profile from PostgreSQL.
- The Loyalty App reads the active stamp collections and individual stamp ledger rows for the customer.
- A customer can have multiple active stamp collections, for example when stamps are collected from different countries.
- The Loyalty App calculates the current visible stamp count from active, non-canceled stamps in each ledger.
- Canceled stamps are used internally for calculation and are not shown to the customer.
- The Loyalty App reads the stamp collection target and reward tiers from PostgreSQL.
- The Loyalty App determines progress toward the next reward tier.
- The Loyalty App includes all rewards up to the 10th stamp, collected rewards, current unused or collectable rewards, and reward or discount-code references in the account projection.
- The PWA renders the loyalty status from the account projection.
- The PWA does not read stamp state directly from PATCH or ROLLER.
- The status view updates by manual refresh.
- When a stamp collection is fully collected up to the 10th stamp, the discount-code reward must be redeemed before the fully collected grid is hidden and a new grid is displayed.
- If a purchase cancellation removes stamps that unlocked a reward, the Loyalty App must also cancel the unearned reward.

### Open questions

- What exact API response shape should replace the current `loyalty_points` and `loyalty_target` fields once the stamp ledger exists?
- What exact rule cancels or revokes rewards that were unlocked by later-canceled stamps?
- What exact rule decides when a fully collected stamp grid is hidden after discount-code redemption?

### Systems involved

- Loyalty PWA
- Loyalty App API
- PostgreSQL app database

## 5. As a Loyalty member, I can view my valid future tickets in the web app.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 6. As a Loyalty member, I can log in to view my waiver status and the waiver itself in the web app.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 7. As a Loyalty member, I can save the PWA on the home screen as an app.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 8. As a customer, once I purchase a ticket valid for accumulating a stamp, I receive an e-mail verifying that I have accumulated a stamp.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 9. As a customer, I receive free admission after I’ve bought the 10th admission.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 10. As a customer, I receive an invitation to host a birthday party at the SuperPark.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 11. As a customer, I get a notification to finalize my unfinished order some time after I abandoned the card.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 12. As a customer, I receive a message that I have not visited SuperPark for some time.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 13. As a customer, I get an email inviting me to the loyalty program after some amount of visits.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 14. As a loyalty member, I see offers relevant to me in the PWA.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.
