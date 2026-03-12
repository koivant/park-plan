# Country and Channel Considerations

Last updated: 2026-03-03

## Why this matters

Signup and loyalty usage improve when login and messaging match local habits.

## Simple market model

1. **Email-first markets**
   - Default ID: email
   - Backup ID: phone
   - Main channel: email

2. **Phone-first markets**
   - Default ID: phone
   - Email optional
   - Main channel: SMS/WhatsApp (with consent)

3. **Mixed markets**
   - Let user choose preferred channel at signup.

## Must-have rules

1. Save consent per channel (email/SMS/WhatsApp).
2. Do not force email in phone-first markets.
3. Keep one customer profile with country + channel preferences.

## Verified facts behind this plan

1. ROLLER online accounts support email, mobile, and social sign-in.
2. Checkout language can be set in URL parameters.

## Sources

1. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
2. https://mysupport.roller.software/hc/en-us/articles/9663642089871-Add-the-full-page-checkout-experience-to-your-website-and-social-pages
3. https://datareportal.com/reports/digital-2025-united-arab-emirates
