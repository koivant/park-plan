import type { QueryResult, QueryResultRow } from "pg";

/** Database client abstraction used across the app and tests. */
export interface Queryable {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

/** Shared customer reference fields persisted from upstream integrations. */
export interface CustomerRefs {
  email: string;
  patchContactId?: unknown;
  rollerCustomerId?: unknown;
}

/** Row shape read from the account projection table. */
export interface AccountProjectionRow extends QueryResultRow {
  profile_json: unknown;
  bookings_json: unknown;
  waivers_json: unknown;
}
