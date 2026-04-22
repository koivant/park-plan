# Authentication

## Confirmed Pilot Approach
- Use app-managed email OTP login.
- Park customers do not use ROLLER credentials for this app.
- Session is bound to normalized email and mapped to provider references.

## OTP Flow
1. User enters email.
2. App sends one-time code.
3. User submits code.
4. App validates code and creates short-lived session.
5. App returns merged account payload.

## Controls
- OTP TTL: max 10 minutes.
- Max attempts per challenge.
- Rate limit by email and IP.
- Hash OTP values at rest.
- Accept each OTP only once.
- Session idle and absolute timeout.

## Future Option
- If stronger assurance is required, use TOTP or WebAuthn instead of email OTP.
