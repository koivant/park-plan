export const patchContactUpdatedPayload = {
  email: "USER@example.com",
  patchContactId: "patch-id",
  loyaltyPoints: 4,
  loyaltyTarget: 10
};

export const patchRewardCodeWebhookPayload = {
  email: "USER@example.com",
  phone: "+358401234567",
  discount_code: "FREE-1"
};

export const patchRewardCodePayloads = {
  discountCode: {
    discount_code: "FREE-ALIAS-1"
  },
  numericDiscountCode: {
    discount_code: 1002
  },
  empty: {}
};
