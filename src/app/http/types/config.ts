export interface HttpConfig {
  routes: {
    root: string;
    openApiJson: string;
    docs: string;
    join: string;
    login: string;
    health: string;
    magicLinkRequest: string;
    magicLinkConsume: string;
    accountView: string;
    logout: string;
    mockHomePark: string;
    account: string;
  };
  cookies: {
    sessionName: string;
    path: string;
    sameSite: "Lax" | "Strict" | "None";
    httpOnly: boolean;
    clearMaxAge: number;
  };
  magicLink: {
    defaultBaseUrl: string;
    tokenQueryParam: string;
    ttlSeconds: number;
    mockEmailSubject: string;
  };
  messages: {
    accountMaybeSent: string;
    checkDockerLogs: string;
    duplicateSignup: string;
    invalidJoinInput: string;
    pendingEmailVerification: string;
  };
  errors: {
    emailRequired: string;
    invalidMagicLink: string;
    tokenRequired: string;
  };
  defaults: {
    accountName: string;
    bookingDate: string;
    bookingVenue: string;
    homePark: string;
    mockHomeParkName: string;
    rewardCode: string;
    waiverStatus: string;
  };
}
