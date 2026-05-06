import type { QueryResult, QueryResultRow } from "pg";

/** Database client abstraction used across the app and tests. */
export interface Queryable {
  query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

/** Shared customer reference fields persisted from upstream integrations. */
export interface CustomerRefs {
  email?: unknown;
  phone?: unknown;
  name?: unknown;
  patchContactId?: unknown;
  rollerCustomerId?: unknown;
  homeParkId?: unknown;
  homeParkName?: unknown;
}
