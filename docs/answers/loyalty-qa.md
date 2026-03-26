# Loyalty Q&A

Last updated: 2026-03-18

Q: Is a custom stamp mechanism viable?
A: For ROLLER-only, verification needed. Public docs clearly show membership benefits and redemption, but they do not clearly document a native "collect visits/stamps, then auto-reward" flow in current public material.
Source: https://mysupport.roller.software/hc/en-us/sections/5460757524239-Memberships
Source: ../sources/internal-evidence.md#ie-001-roller-support-note-2026-03-03

Q: Should we wait for ROLLER's own points implementation?
A: It is one valid option, but timeline and scope are still verification needed. We have an internal support note saying target was May 2026, but public feature documentation is still not published.
Source: ../sources/internal-evidence.md#ie-001-roller-support-note-2026-03-03

Q: Should we get Patch Retention or some other similar service to implement stamps?
A: Evaluate Patch first because ROLLER has an official Patch integration path. Note: this integration requires the ROLLER API add-on, and final provider choice is still verification needed until pilot results are compared.
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention
Source: https://www.roller.software/integrations/partner/patch-retention

Q: Is Patch integration with ROLLER one-way or two-way?
A: The documented integration is one-way from ROLLER to Patch.
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention

Q: Does Patch visualize loyalty as currency, points, or both?
A: Both appear in Patch material. Patch uses "Loyalty Cash" naming, and widget setup docs also mention showing loyalty earnings as points or cash. Note: that points/cash display toggle is marked as eCommerce-only in Patch docs, so support for this exact option in your ROLLER attraction setup is verification needed.
Source: https://help.patchretention.com/loyalty-program-rewards-widget
Source: https://patchretention.com/loyalty-rewards

Q: For stamp loyalty, should progress be shown as currency or as a milestone track?
A: For a stamp model (`visit count -> free pass`), milestone/progress-style display is usually clearer than currency-like display. Public Patch docs do not clearly confirm a native timeline/stamp-track UI template, so this is verification needed.
Source: https://help.patchretention.com/loyalty-program-rewards-widget
Source: https://help.patchretention.com/installing-the-rewards-widget

Q: What loyalty features does ROLLER currently offer?
A: Verified in public docs: memberships, membership benefits, and POS benefit verification/redemption.
Source: https://mysupport.roller.software/hc/en-us/sections/5460757524239-Memberships
Source: https://mysupport.roller.software/hc/en-us/articles/14224927658639-Verify-member-benefits-at-POS
Source: https://mysupport.roller.software/hc/en-us/articles/360001465135-Redeem-memberships-at-POS

Q: What loyalty features is ROLLER missing for this plan?
A: A native stamp/points flow is research needed in current public docs. Treat this as unconfirmed until ROLLER publishes final built-in loyalty documentation.
Source: https://mysupport.roller.software/hc/en-us/sections/5460757524239-Memberships
Source: ../sources/internal-evidence.md#ie-001-roller-support-note-2026-03-03

Q: What can be used as loyalty account key?
A: Email and mobile phone are supported as sign-in/account identifiers in online accounts. Social sign-in is also supported. WhatsApp as a direct account key is still research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts

Q: In phone-first markets, is phone login supported?
A: Yes. ROLLER online accounts support sign-in with mobile/cell number and one-time code login.
Source: https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts

Q: When is native ROLLER loyalty expected and what features will it include?
A: Public release timing and final feature scope are research needed. Current public docs confirm memberships and membership redemption, but not a full native points/stamp program spec.
Source: https://mysupport.roller.software/hc/en-us/sections/5460757524239-Memberships
Source: ../sources/internal-evidence.md#ie-001-roller-support-note-2026-03-03

Q: Are there published examples of Patch loyalty in attractions?
A: Yes. Patch and ROLLER publish integration material, and Patch case studies show loyalty usage in attraction-style venues. Note: published examples mostly describe spend-based rewards, not a strict stamp mechanic.
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention
Source: https://www.roller.software/integrations/partner/patch-retention
Source: https://patchretention.com/blog/x-golf-case-study-patch-offers-everything-we-need-in-one-platform

Q: If we later move loyalty from Patch to native ROLLER loyalty, how do we migrate?
A: A full migration method is not documented publicly yet. The documented action today is that Patch can be disconnected by resetting the API key. Data migration mapping/rules between systems is research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention

Q: How do clients connect their purchases to ROLLER?
A: Purchases connect when the sale is made in ROLLER channels (for example online checkout, POS, Venue Manager, self-serve kiosk, or API), and the booking holder is identified with guest details such as email or phone.
Source: https://mysupport.roller.software/hc/en-us/articles/360000086056-Create-and-manage-bookings-from-Venue-Manager
Source: https://mysupport.roller.software/hc/en-us/articles/115001724674-Bookings-report

Q: Can we utilise a QR code to show to the cashier to register loyalty stamps?
A: QR/scannable IDs can be used for member identification at POS. Whether that scan directly adds a stamp is research needed and depends on the loyalty engine.
Source: https://mysupport.roller.software/hc/en-us/articles/13606318921359-Enter-a-custom-ID-for-a-membership-at-POS
Source: https://mysupport.roller.software/hc/en-us/articles/12886953128207-Print-membership-cards-at-POS

Q: Why should a visitor come back and stay active?
A: Loyalty should give a clear reason to return: immediate first-visit value, visible progress toward a reward, and ongoing local member surprises.
Source: ../sources/internal-evidence.md#ie-003-owner-loyalty-strategy-input-2026-03-06

Q: What loyalty program concepts are currently under consideration?
A:
1. Paid membership with park-specific perks.
2. Free join with instant reward plus milestone rewards.
3. Account-first model with milestone rewards plus local surprises.
Source: ../sources/internal-evidence.md#ie-003-owner-loyalty-strategy-input-2026-03-06

Q: Are park mascots relevant to future loyalty planning?
A: Yes. Mascots can be used as an engagement layer (progress stories, milestone moments, surprises) to make families want to return more often.
Source: ../sources/internal-evidence.md#ie-004-mascot-relevance-input-2026-03-06

Q: Do we need a separate system for logging in users?
A: No. Users can log in with ROLLER online accounts. This requires online accounts to be enabled and progressive checkout in use.
Source: https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts

Q: Can we forward events from ROLLER to external systems?
A: Yes. Progressive checkout can send events to GA4, Meta, TikTok and GTM. For broader external integrations, ROLLER also provides API options. Exact event list for this account is research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview

Q: New operator wants to launch a new park. How much work there is to set up integration to ROLLER and PATCH?
A: research needed. No public standard effort estimate is published. Actual work depends on venue setup, checkout/product configuration, and Patch onboarding scope.
Source: https://mysupport.roller.software/hc/en-us/articles/9681919703567-Create-and-manage-HQ-checkouts
Source: https://help.patchretention.com/how-to-setup-the-patch-roller-integration

Q: Do we need a separate account for ROLLER and PATCH for each park or is there one common account for all parks?
A: ROLLER supports one HQ setup managing many park venues. Day-to-day operations stay venue-scoped, and HQ can use multi-venue access where enabled. Patch supports multi-location, but park-level configuration is still needed per location.
Source: https://mysupport.roller.software/hc/en-us/articles/9681919703567-Create-and-manage-HQ-checkouts
Source: https://mysupport.roller.software/hc/en-us/articles/360001653455-API-overview
Source: https://help.patchretention.com/how-to-set-up-the-roller-abandoned-cart-automation

Q: Is loyalty resolved before or after a ticket purchase?
A: Both can happen depending on the benefit. Membership benefits can be applied during purchase/redemption, while stamp/visit progress is usually updated after a qualifying purchase/check-in event.
Source: https://mysupport.roller.software/hc/en-us/articles/14224927658639-Verify-member-benefits-at-POS
Source: https://mysupport.roller.software/hc/en-us/articles/360001465135-Redeem-memberships-at-POS
Source: https://help.patchretention.com/what-data-fields-are-mapped-from-roller-to-patch

Q: How is ROLLER and PATCH managed at global level and how in park level?
A: ROLLER supports HQ-level setup (for example shared checkout management), and Patch supports multi-location campaign setup. Exact role and permission split between global and park teams is still research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/9681919703567-Create-and-manage-HQ-checkouts
Source: https://help.patchretention.com/how-to-set-up-the-roller-abandoned-cart-automation

Q: What approach is best to define parent pricing (vs. kids)?
A: Use separate ticket products/variations for adults and children, then apply time-based price rules for peak/off-peak and bundle logic. Automatic parent-exception logic (for example child-height based) is research needed.
Source: https://mysupport.roller.software/hc/en-us/articles/11149328433935-Create-time-based-price-rules
Source: https://mysupport.roller.software/hc/en-us/articles/11149309350671-Get-started-with-price-rules
