# Proposition: Patch Loyalty + Custom Stamp UI in WordPress

Last updated: 2026-03-18

## Summary

Use Patch for loyalty calculations, but build a custom stamp-style progress UI in WordPress to show visitor experience.

## How loyalty works

1. ROLLER captures purchases and visitor identity.
2. Data syncs from ROLLER to Patch.
3. WordPress custom component reads loyalty data and renders stamp progress.
4. Rewards are triggered by mapped rule logic (for example visit milestones).

## How visitor data is captured

1. Identity and purchase history are captured in ROLLER accounts/bookings.
2. Patch receives data for loyalty logic and campaign use.
3. Custom UI reads loyalty state through integration APIs.

## Why choose this

1. Best control over visual experience (stamp timeline style).
2. Can match exact brand and UX requirements.
3. Can hide points/currency framing if that is not wanted.

## Risks

1. Highest implementation and maintenance effort.
2. More integration points and more failure modes.
3. Custom build may be short-lived if native ROLLER loyalty later replaces it.

## Decision fit

Choose this only if exact stamp UX is mandatory and cannot be achieved with provider-native UI.

## Sources

1. https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention
2. https://help.patchretention.com/loyalty-program-rewards-widget
3. https://help.patchretention.com/installing-the-rewards-widget
