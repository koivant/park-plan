export const patchContactUpdatedPayload = {
  email: "USER@example.com",
  patchContactId: "patch-id",
  loyaltyPoints: 4,
  loyaltyTarget: 10
};

export const patchRewardCodeWebhookPayload = {
  email: "USER@example.com",
  patchContactId: "patch-id",
  codes: ["FREE-1", "FREE-2"]
};

export const patchRewardCodePayloads = {
  singleCode: {
    code: "FREE-1"
  },
  multipleCodes: {
    codes: ["FREE-1", 1002, null]
  },
  empty: {}
};
