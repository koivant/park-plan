import { httpConfig } from "../config.js";
import type { AccountViewData } from "../types/account-view.js";
import { escapeHtml, createPageHtml, renderList } from "./html.js";
import { getArray, getRecord, numberValue, textValue } from "./value-format.js";

export function createJoinFormHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Join Loyalty Demo</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #f4f6f8; color: #17212b; }
    main { max-width: 640px; margin: 32px auto; background: #fff; border: 1px solid #dde3ea; border-radius: 12px; padding: 20px; }
    h1 { font-size: 1.4rem; margin: 0 0 8px; }
    p { margin: 0 0 16px; color: #45576a; }
    form { display: grid; gap: 10px; }
    label { display: grid; gap: 4px; font-size: 0.95rem; }
    input { font: inherit; padding: 10px; border: 1px solid #c5ced8; border-radius: 8px; }
    button { margin-top: 8px; font: inherit; padding: 10px 14px; border: 0; border-radius: 8px; background: #0f5bb8; color: #fff; cursor: pointer; }
  </style>
</head>
<body>
  <main>
    <h1>Join Loyalty Program</h1>
    <p>Sign up with your contact details.</p>
    <form method="post" action="${httpConfig.routes.join}">
      <label>Name <input name="name" type="text" autocomplete="name"></label>
      <label>Email <input name="email" type="email" required autocomplete="email"></label>
      <label>Phone <input name="phone" type="tel" autocomplete="tel"></label>
      <button type="submit">Create Account</button>
    </form>
  </main>
</body>
</html>`;
}

export function createJoinResultHtml(message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Join Result</title>
</head>
<body>
  <main>
    <p>${message}</p>
    <p><a href="${httpConfig.routes.join}">Back to form</a></p>
  </main>
</body>
</html>`;
}

export function createLoginFormHtml(): string {
  return createPageHtml(
    "Loyalty Login",
    `<h1>Loyalty Login</h1>
    <p>Enter the email used for your loyalty account.</p>
    <form method="post" action="${httpConfig.routes.magicLinkRequest}">
      <label>Email <input name="email" type="email" required autocomplete="email"></label>
      <button type="submit">Send magic link</button>
    </form>
    <p><a href="${httpConfig.routes.join}">Create a test customer</a></p>`
  );
}

export function createLoginResultHtml(message: string): string {
  return createPageHtml(
    "Magic Link Sent",
    `<h1>Magic Link Sent</h1>
    <p>${escapeHtml(message)}</p>
    <p><a href="${httpConfig.routes.login}">Back to login</a></p>`
  );
}

export function createAccountViewHtml(account: AccountViewData): string {
  const profile = getRecord(account.profile);
  const homePark = getRecord(account.home_park);
  const bookings = getArray(account.upcoming_bookings);
  const rewards = getArray(account.discount_codes);
  const waivers = getArray(account.waivers);
  const name = textValue(profile.name) || textValue(account.email) || httpConfig.defaults.accountName;
  const points = numberValue(account.loyalty_points) ?? 0;
  const target = numberValue(account.loyalty_target);
  const stampText = target ? `${points} / ${target} stamps` : `${points} stamps`;

  return createPageHtml(
    "My Loyalty Account",
    `<header class="topline">
      <div>
        <h1>${escapeHtml(name)}</h1>
        <p>${escapeHtml(textValue(account.email) || "")}</p>
      </div>
      <form method="post" action="${httpConfig.routes.logout}"><button type="submit">Log out</button></form>
    </header>
    <section>
      <h2>Loyalty</h2>
      <p class="metric">${escapeHtml(stampText)}</p>
      <p>Home park: ${escapeHtml(textValue(homePark.parkName) || textValue(homePark.parkId) || httpConfig.defaults.homePark)}</p>
    </section>
    <section>
      <h2>Bookings</h2>
      ${renderList(bookings, (booking) => {
        const item = getRecord(booking);
        const venue = textValue(item.venue) || textValue(item.parkId) || httpConfig.defaults.bookingVenue;
        const startsAt = textValue(item.startsAt) || textValue(item.bookingDate) || httpConfig.defaults.bookingDate;
        const tickets = numberValue(item.ticketCount);
        return `${escapeHtml(venue)} · ${escapeHtml(startsAt)}${tickets ? ` · ${tickets} tickets` : ""}`;
      })}
    </section>
    <section>
      <h2>Rewards</h2>
      ${renderList(rewards, (reward) => {
        const item = getRecord(reward);
        return `${escapeHtml(textValue(item.code) || httpConfig.defaults.rewardCode)} ${item.used === true ? "(used)" : "(active)"}`;
      })}
    </section>
    <section>
      <h2>Waivers</h2>
      ${renderList(waivers, (waiver) => escapeHtml(textValue(getRecord(waiver).status) || httpConfig.defaults.waiverStatus))}
    </section>`
  );
}

export function createMockHomeParkHtml(parkName: string): string {
  return createPageHtml(
    "Home Park",
    `<h1>${escapeHtml(parkName)}</h1>
    <p>This is the mock home park front page used for local logout testing.</p>
    <p><a href="${httpConfig.routes.login}">Back to loyalty login</a></p>`
  );
}
