/** Normalized booking data persisted to customer/booking tables. */
export interface NormalizedRollerBooking {
  bookingId: string;
  bookingReference?: string;
  rollerCustomerId?: string;
  loyaltyEnrollmentAllowed?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  source?: string;
  channel?: string;
  venue?: string;
  parkId?: string;
  parkIds: string[];
  bookingDate?: string;
  bookingEndDate?: string;
  startsAt?: string;
  ticketCount?: number;
  status?: string;
}
