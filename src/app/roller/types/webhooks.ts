/** Normalized booking data persisted to customer/booking tables. */
export interface NormalizedRollerBooking {
  bookingId: string;
  bookingReference?: string;
  rollerCustomerId?: string;
  loyaltyEnrollmentAllowed?: boolean;
  name?: string;
  source?: string;
  channel?: string;
  /** TODO(roller): Confirm the exact payload field for human-readable venue/park name, if provided. */
  venue?: string;
  parkId?: string;
  parkIds: string[];
  bookingDate?: string;
  bookingEndDate?: string;
  startsAt?: string;
  ticketCount?: number;
  status?: string;
}
