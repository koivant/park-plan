import type { Queryable } from "./database.js";

/** Runtime configuration required by the HTTP app. */
export interface AppConfig {
  nodeEnv: string;
  magicLinkTtlSeconds?: number;
  loyaltyAppBaseUrl?: string;
  patchApiKey?: string;
  rollerApiBaseUrl?: string;
  rollerClientId?: string;
  rollerClientSecret?: string;
  rollerGuestDetailPathTemplate?: string;
}

/** Dependency overrides used by tests and local bootstrapping. */
export interface CreateAppOptions {
  db?: Queryable;
  config?: AppConfig;
  now?: () => Date;
  randomMagicToken?: () => string;
  randomUUID?: () => string;
}

/** Fully resolved app dependencies passed to route registration modules. */
export interface AppDependencies {
  db: Queryable;
  config: AppConfig;
  now: () => Date;
  randomMagicToken: () => string;
  randomUUID: () => string;
}
