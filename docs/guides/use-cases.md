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

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 3. As a Loyalty program member, I accumulate a stamp for each admission ticket I purchase.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

## 4. As a Loyalty member, I can view my loyalty status in the web app and see the number of stamps I have.

### Flow explanation from customers perspective

TBD.

### Flow explanation from data point of view

TBD.

### Open questions

TBD.

### Systems involved

TBD.

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
