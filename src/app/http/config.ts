import type { HttpConfig } from "./types/config.js";

export const httpConfig: HttpConfig = {
  routes: {
    root: "/",
    openApiJson: "/openapi/openapi.json",
    docs: "/docs",
    join: "/join",
    login: "/login",
    health: "/health",
    magicLinkRequest: "/auth/magic-link/request",
    magicLinkConsume: "/auth/magic-link",
    accountView: "/account-view",
    logout: "/logout",
    mockHomePark: "/mock/home-park",
    account: "/account"
  },
  cookies: {
    sessionName: "lp_session",
    path: "/",
    sameSite: "Lax",
    httpOnly: true,
    clearMaxAge: 0
  },
  magicLink: {
    defaultBaseUrl: "http://localhost:3000",
    tokenQueryParam: "token",
    ttlSeconds: 600,
    mockEmailSubject: "Your SuperPark loyalty login link"
  },
  messages: {
    accountMaybeSent: "If an account exists, a sign-in link has been sent.",
    checkDockerLogs: "Check the API Docker logs for the mock email login link.",
    duplicateSignup: "These contact details have already been signed up.",
    invalidJoinInput: "Invalid form input. Email is required.",
    pendingEmailVerification: "pending email verification"
  },
  errors: {
    emailRequired: "email_required",
    invalidMagicLink: "invalid_magic_link",
    tokenRequired: "token_required"
  },
  defaults: {
    accountName: "Loyalty account",
    bookingDate: "Date not set",
    bookingVenue: "Park",
    homePark: "Not set",
    mockHomeParkName: "your home park",
    rewardCode: "Reward code",
    waiverStatus: "Recorded"
  }
};
