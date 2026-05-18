import type { QueryResult, QueryResultRow } from "pg";
import type { Queryable } from "../../types/database.js";

export interface QueryCall {
  text: string;
  params?: unknown[];
}

export function createResult<T extends QueryResultRow>(rows: T[] = [], rowCount = rows.length): QueryResult<T> {
  return {
    rows,
    rowCount,
    command: "",
    oid: 0,
    fields: []
  };
}

export function createDb(handler: (text: string, params?: unknown[]) => QueryResult<QueryResultRow>): Queryable & { calls: QueryCall[] } {
  const calls: QueryCall[] = [];

  return {
    calls,
    async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
      calls.push({ text, params });
      return handler(text, params) as QueryResult<T>;
    }
  };
}
