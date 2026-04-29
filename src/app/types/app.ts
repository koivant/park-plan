import type { Queryable } from "./database.js";

/** Runtime configuration required by the HTTP app. */
export interface AppConfig {
  nodeEnv: string;
  otpTtlSeconds: number;
}

/** Dependency overrides used by tests and local bootstrapping. */
export interface CreateAppOptions {
  db?: Queryable;
  config?: AppConfig;
  now?: () => Date;
  randomOtp?: () => string;
  randomUUID?: () => string;
}

/** Fully resolved app dependencies passed to route registration modules. */
export interface AppDependencies {
  db: Queryable;
  config: AppConfig;
  now: () => Date;
  randomOtp: () => string;
  randomUUID: () => string;
}
