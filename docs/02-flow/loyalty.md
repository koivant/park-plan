# Loyalty (Flow)

Last updated: 2026-03-12

Q: What is the flow if we use Patch (or similar) for stamps?
A:
1. Guest buys via ROLLER.
2. Guest identity is email or phone.
3. Partner platform receives ROLLER data.
4. Partner applies stamp/points rule.
5. Partner sends reward message.
6. Reward is redeemed at venue.

Q: What does ROLLER do now in loyalty flow?
A: ROLLER handles membership purchase, member benefits, and benefit redemption.

Q: How do clients connect their purchases to ROLLER in the flow?
A:
1. Guest buys in ROLLER (online checkout or venue POS).
2. Guest identity is captured (email or phone).
3. Purchase is linked to that guest profile in ROLLER.

Q: Do we need a separate login flow?
A:
1. No separate login system is needed.
2. Guest signs in through ROLLER account flow.
3. Same account identity (email or phone) is used for loyalty.

Q: How does QR code work at cashier for stamps?
A:
1. Guest shows personal QR code at venue.
2. Cashier scans QR code to identify the guest profile/booking.
3. Purchase or check-in is linked to that guest.
4. Loyalty rule then awards the stamp/point.

Q: What repeat-behavior flow should loyalty create?
A:
1. First visit captures account data (email or phone).
2. Guest receives immediate value or starts visible progress.
3. Each qualifying visit moves progress toward milestone reward.
4. Local benefits/surprises keep the program active between visits.

Q: How can mascots be used in the loyalty flow?
A:
1. Guest selects or is matched with a mascot theme.
2. Milestones are presented as mascot progress moments.
3. Rewards and surprises are delivered with mascot-themed messages.

Q: Can ROLLER show Patch points in member pages?
A:
1. Current public docs for ROLLER online accounts show passes, memberships, gift cards, bookings, and payment/account details.
2. Public docs do not show native display of Patch points balance/progress inside ROLLER member pages.
3. Treat this as not supported until ROLLER confirms account-specific capability.
Source: https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention

Q: Can Patch show progress directly?
A:
1. Yes. Patch provides a Loyalty Cash/Rewards widget intended to show loyalty earning and redemption experience directly on the website.
2. The widget can be installed and enabled without building a custom front-end component first.
Source: https://help.patchretention.com/loyalty-program-rewards-widget
Source: https://help.patchretention.com/installing-the-rewards-widget

Q: Do you need a custom WordPress component + API?
A:
1. Not for baseline progress visibility, if you use Patch widget.
2. You need custom WordPress component + API only if you want a fully custom loyalty UI beyond what the widget supports.
3. Patch supports API-key based integrations for custom builds.
Source: https://help.patchretention.com/installing-the-rewards-widget
Source: https://help.patchretention.com/how-to-create-an-api-key
