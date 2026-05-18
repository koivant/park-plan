import { httpConfig } from "../config.js";
import type { AccountViewData } from "../types/account-view.js";
import { getRecord, textValue } from "./value-format.js";

export function createMockHomeParkRedirect(account: AccountViewData | undefined): string {
  const homePark = getRecord(account?.home_park);
  const params = new URLSearchParams();
  const parkId = textValue(homePark.parkId);
  const parkName = textValue(homePark.parkName);

  if (parkId) {
    params.set("parkId", parkId);
  }

  if (parkName) {
    params.set("parkName", parkName);
  }

  const query = params.toString();
  return query ? `${httpConfig.routes.mockHomePark}?${query}` : httpConfig.routes.mockHomePark;
}
