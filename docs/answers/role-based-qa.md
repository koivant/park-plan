# Role-Based Q&A

Last updated: 2026-03-26

Q: How can cashier identify guest account quickly?
A: Use QR/scannable membership identifier first; fallback to phone or email account lookup.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/13606318921359-Enter-a-custom-ID-for-a-membership-at-POS
2. https://mysupport.roller.software/hc/en-us/articles/12886953128207-Print-membership-cards-at-POS
3. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts

Q: How is waiver handled for visitor entry?
A: Online waiver should be default, with QR links at queue/entrance/parking and POS fallback to send waiver link.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/10367792689935-Get-started-with-online-waivers
2. https://mysupport.roller.software/hc/en-us/articles/15193945294479-Create-a-waiver-QR-code-sign-for-fast-check-ins
3. https://mysupport.roller.software/hc/en-us/articles/360000069755-Search-for-waivers-at-POS

Q: Can guests use phone instead of email?
A: Yes. ROLLER online accounts support mobile sign-in with one-time code.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/7382787636879-Sign-in-and-use-online-accounts

Q: How does guest purchase connect to loyalty/account?
A: Purchase must be created in ROLLER channels and linked to identified guest profile (email or phone).
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/360000086056-Create-and-manage-bookings-from-Venue-Manager
2. https://mysupport.roller.software/hc/en-us/articles/115001724674-Bookings-report

Q: Can guests see loyalty progress now?
A: For interim path, use Patch widget/provider experience; native ROLLER visit-progress UI remains unconfirmed in this source set.
Sources:
1. https://help.patchretention.com/loyalty-program-rewards-widget
2. ../sources/internal-evidence.md#ie-005-roller-meeting-notes-on-visit-tracking-and-ui-gap-logged-2026-03-18

Q: What if loyalty stamp/point is missing?
A: Manual correction process and edge-case rules must be locked before launch; treat as open operational decision.
Sources:
1. ../sources/internal-evidence.md#ie-007-progress-and-open-actions-baseline-2026-03-04
2. https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention

Q: Can non-playing adults or food-only purchases earn loyalty?
A: Not locked. This must be decided in final loyalty rule definition.
Sources:
1. ../sources/internal-evidence.md#ie-003-owner-loyalty-strategy-input-2026-03-06
2. ../sources/internal-evidence.md#ie-007-progress-and-open-actions-baseline-2026-03-04

Q: When should support escalate case to ROLLER or Patch?
A: Escalate when account-linking, sync, or reward-rule issues cannot be resolved by defined local correction process.
Sources:
1. https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention
2. ../sources/internal-evidence.md#ie-007-progress-and-open-actions-baseline-2026-03-04
