/** Normalized booking data used by the loyalty account projection. */
export interface NormalizedRollerBooking {
  bookingId: string;
  rollerCustomerId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  venue?: string;
  startsAt?: string;
  ticketCount?: number;
  status?: string;
}

/** Flattened waiver entry stored in the loyalty account projection. */
export type WaiverProjectionEntry = Record<string, unknown> & {
  waiverId: string;
  status: string;
  signedAt?: string;
  isForMinor?: boolean;
  guestId?: string;
  versionWaiverId: string;
  expiryDate?: string;
  parentWaiverId?: string;
};
