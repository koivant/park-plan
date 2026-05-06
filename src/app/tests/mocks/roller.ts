export const existingBookingProjection = {
  bookingId: "booking-old",
  venue: "SuperPark Sello",
  startsAt: "2026-05-01T10:00:00.000Z",
  ticketCount: 2,
  status: "confirmed"
};

export const existingSignedWaiverProjection = {
  waiverId: "waiver-old",
  status: "signed"
};

export const rollerBookingWebhookPayload = {
  id: "67d2ada6-10cc-4177-909d-430f3b2593d4",
  sendDate: "2026-05-02T09:45:05.000Z",
  type: "Booking" as const,
  eventType: "Created" as const,
  eventDate: "2026-05-02T09:45:00.000Z",
  data: {
    bookingReference: "booking-1",
    uniqueId: "booking-1",
    customerId: 123456,
    email: "USER@example.com",
    customerFlags: ["LOYALTY_ENROLLMENT_ALLOWED"],
    firstName: "Taylor",
    lastName: "Example",
    phone: "+358401234567",
    venue: "SuperPark Vantaa",
    status: "confirmed",
    items: [
      {
        quantity: 3,
        bookingDate: "2026-05-02",
        sessionStartTime: "10:00",
        tickets: [
          {
            locations: [69184]
          }
        ]
      }
    ]
  }
};

export const bookingWebhookWithoutEmailPayload = {
  ...rollerBookingWebhookPayload,
  data: {
    bookingReference: "booking-1",
    uniqueId: "booking-1",
    customerId: 123456,
    status: "Paid",
    items: [
      {
        quantity: 3,
        bookingDate: "2026-05-02",
        sessionStartTime: "10:00"
      }
    ]
  }
};

export const bookingWebhookForFailurePayload = {
  ...rollerBookingWebhookPayload,
  data: {
    bookingReference: "booking-1",
    uniqueId: "booking-1",
    customerId: 123456,
    email: "user@example.com"
  }
};

export const normalizedRollerBooking = {
  bookingId: "booking-1",
  bookingReference: "booking-1",
  rollerCustomerId: "123456",
  loyaltyEnrollmentAllowed: true,
  email: "user@example.com",
  firstName: "Taylor",
  lastName: "Example",
  name: undefined,
  phone: "+358401234567",
  source: undefined,
  channel: undefined,
  venue: "SuperPark Vantaa",
  parkId: "69184",
  parkIds: ["69184"],
  bookingDate: "2026-05-02",
  bookingEndDate: undefined,
  startsAt: "2026-05-02T10:00:00.000Z",
  ticketCount: 3,
  status: "confirmed"
};

export const rollerSignedWaiverWebhookPayload = {
  id: "67d2ada6-10cc-4177-909d-430f3b2593d4",
  sendDate: "2026-05-02T09:45:05.000Z",
  type: "SignedWaiver" as const,
  eventType: "Created" as const,
  eventDate: "2026-05-02T09:45:00.000Z",
  data: [
    {
      signedWaiverId: 18829121,
      waiverId: 13,
      firstName: "Taylor",
      lastName: "Example",
      guestId: 64310293,
      email: "user@example.com",
      contactNumber: "+358401234567",
      isForMinor: false,
      isValid: true,
      createdDate: "2026-05-02T09:45:00.000Z",
      expiryDate: "2027-05-02T09:45:00.000Z"
    },
    {
      signedWaiverId: 18829122,
      parentSignedWaiverId: 18829121,
      waiverId: 13,
      firstName: "Child",
      lastName: "Example",
      guestId: 64310294,
      isForMinor: true,
      isValid: true,
      createdDate: "2026-05-02T09:45:00.000Z",
      expiryDate: "2027-05-02T09:45:00.000Z"
    }
  ]
};

export const rollerSignedWaiverProfile = {
  email: "user@example.com",
  name: "Taylor Example",
  firstName: "Taylor",
  lastName: "Example",
  phone: "+358401234567"
};

export const rollerSignedWaiverProjectionEntries = [
  {
    waiverId: "18829121",
    status: "valid",
    signedAt: "2026-05-02T09:45:00.000Z",
    isForMinor: false,
    guestId: "64310293",
    versionWaiverId: "13",
    expiryDate: "2027-05-02T09:45:00.000Z",
    parentWaiverId: undefined
  },
  {
    waiverId: "18829122",
    status: "valid",
    signedAt: "2026-05-02T09:45:00.000Z",
    isForMinor: true,
    guestId: "64310294",
    versionWaiverId: "13",
    expiryDate: "2027-05-02T09:45:00.000Z",
    parentWaiverId: "18829121"
  }
];

export const existingAccountProjectionRow = {
  bookingWithoutEmailWebhook: bookingWebhookWithoutEmailPayload,
  bookingWebhookForFailure: bookingWebhookForFailurePayload
};
