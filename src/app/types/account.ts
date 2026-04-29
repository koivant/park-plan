/** In-memory shape of the aggregated customer account projection. */
export interface AccountProjectionState {
  profile: Record<string, unknown>;
  upcomingBookings: Record<string, unknown>[];
  waivers: Record<string, unknown>[];
}

/** Profile fields that can be merged into the account projection. */
export interface ProfileUpdate {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
}
