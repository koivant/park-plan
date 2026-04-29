export interface RollerWebhookRecord {
  id: string;
  webhookId?: number | string;
  type?: string | null;
  url?: string | null;
  endpointUrl?: string | null;
  callbackUrl?: string | null;
  enabled?: boolean | null;
  events?: Record<string, unknown> | string[] | null;
  configuration?: {
    url?: string;
    enabled?: boolean;
    authentication?: {
      apiKey?: string;
      isBasicAuthentication?: boolean;
    };
    webhooks?: Record<
      string,
      {
        events?: string[];
        include?: Record<string, boolean>;
        filter?: Record<string, unknown>;
      }
    >;
  };
  [key: string]: unknown;
}

export interface RollerWebhookCreatePayload {
  url: string;
  enabled: boolean;
  authentication: {
    apiKey: string;
  };
  webhooks: Record<
    string,
    {
      events: string[];
      include?: Record<string, boolean>;
    }
  >;
}

export interface ManagedRollerWebhook {
  key: string;
  createPayload: RollerWebhookCreatePayload;
}

export interface RollerWebhookClient {
  listWebhooks(): Promise<RollerWebhookRecord[]>;
  createWebhook(payload: RollerWebhookCreatePayload): Promise<RollerWebhookRecord>;
  deleteWebhook(id: string): Promise<void>;
}

export interface RollerAccessToken {
  accessToken: string;
  expiresAt: number;
}

export interface RollerTokenProvider {
  getAccessToken(): Promise<string>;
  invalidateToken(): void;
}

export interface RollerRateLimiter {
  waitTurn(): Promise<void>;
}
