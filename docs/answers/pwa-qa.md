# PWA Q&A

Last updated: 2026-03-12

## ROLLER-related QA

Q: Does using a PWA remove the need for ROLLER Payments in progressive checkout?
A: No. Progressive checkout still requires ROLLER Payments, even if the website front end is a PWA.
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout

Q: Can PWA break the path to ROLLER checkout?
A: Potentially yes. Service workers can intercept navigation and resource requests. If checkout-related routes or scripts are handled incorrectly, checkout/tracking can fail.
Source: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
Source: https://mysupport.roller.software/hc/en-us/articles/4941711216015-Track-guest-behavior-and-conversions-in-progressive-checkouts

Q: Can ticket purchase work offline in this setup?
A: PWA can make some content available offline, but ticket checkout/payment should be treated as online-only.
Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
Source: https://mysupport.roller.software/hc/en-us/articles/5517737900687-Create-your-online-checkout

Q: Does PWA change ROLLER loyalty logic?
A: No direct source says PWA changes loyalty logic. Based on current architecture docs, loyalty logic remains in ROLLER and/or loyalty partner systems. PWA impact here is limited to front-end experience (verification needed).
Source: https://mysupport.roller.software/hc/en-us/sections/5460757524239-Memberships
Source: https://mysupport.roller.software/hc/en-us/articles/12557902973839-ROLLER-Patch-Retention

## WordPress-related QA

Q: Does WordPress have built-in PWA support?
A: WordPress PWA capability is presented through plugin building blocks and custom implementation patterns.
Source: https://wordpress.org/plugins/pwa/
Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps

Q: What is the minimum needed for a PWA?
A: A service worker, a web app manifest, and HTTPS.
Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
Source: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
Source: https://wordpress.org/plugins/pwa/

Q: What is the key PWA rule for this project?
A: Recommended rule: keep PWA focused on content speed and app-like UX, while keeping checkout/payment flows on ROLLER-hosted paths.
Source: https://mysupport.roller.software/hc/en-us/articles/5494935998351-Share-your-online-checkout
Source: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps
