# Abandoned Cart Recovery Flow

Last updated: 2026-03-04

1. Visitor starts checkout but does not purchase.
2. Checkout/marketing events are sent (for example through GTM/integration flow).
3. Rule checks: started checkout, no purchase after delay.
4. If contact + consent exist, send reminder message.
5. Message includes a resume link where supported by the integration platform.
6. Visitor returns and completes purchase.

Important limits:
1. No contact info means no direct reminder.
2. Consent and local messaging rules always apply.
3. Recovery behavior depends on the integration platform and cart/session validity.
