import { describe, expect, it } from "vitest";
import { extractPatchRewardCodes } from "../patch/utils/reward-codes.js";
import { patchRewardCodePayloads } from "./mocks/patch.js";

describe("PATCH webhook utils", () => {
  it("extracts reward codes from either the single code field or the codes array", () => {
    expect(extractPatchRewardCodes(patchRewardCodePayloads.singleCode)).toEqual(["FREE-1"]);
    expect(extractPatchRewardCodes(patchRewardCodePayloads.multipleCodes)).toEqual(["FREE-1", "1002"]);
    expect(extractPatchRewardCodes(patchRewardCodePayloads.empty)).toEqual([]);
  });
});
