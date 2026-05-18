import { describe, expect, it } from "vitest";
import { extractPatchRewardCodes } from "../../patch/utils/reward-codes.js";
import { patchRewardCodePayloads } from "../mocks/patch.js";

describe("PATCH webhook utils", () => {
  it("extracts reward codes from discount_code", () => {
    expect(extractPatchRewardCodes(patchRewardCodePayloads.discountCode)).toEqual(["FREE-ALIAS-1"]);
    expect(extractPatchRewardCodes(patchRewardCodePayloads.numericDiscountCode)).toEqual(["1002"]);
    expect(extractPatchRewardCodes(patchRewardCodePayloads.empty)).toEqual([]);
  });
});
