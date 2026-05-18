import { httpConfig } from "../config.js";

export function createMagicLinkUrl(baseUrl: string | undefined, token: string): string {
  const url = new URL(httpConfig.routes.magicLinkConsume, baseUrl || httpConfig.magicLink.defaultBaseUrl);
  url.searchParams.set(httpConfig.magicLink.tokenQueryParam, token);
  return url.toString();
}

export function logMockEmail(to: string, magicLink: string): void {
  console.info({
    type: "mock_email",
    to,
    subject: httpConfig.magicLink.mockEmailSubject,
    magicLink
  });
}
