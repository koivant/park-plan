import { z } from "zod";
import {
  acceptedResponseSchema,
  accountQuerySchema,
  accountResponseSchema,
  errorResponseSchema,
  healthResponseSchema,
  otpRequestBodySchema,
  otpRequestResponseSchema,
  otpVerifyBodySchema,
  otpVerifyResponseSchema,
  patchContactUpdatedBodySchema,
  patchRewardCodeBodySchema,
  rollerBookingBodySchema,
  rollerSignedWaiverBodySchema
} from "./schemas.js";

type HttpMethod = "get" | "post";

interface RouteDoc {
  method: HttpMethod;
  path: string;
  summary: string;
  requestBody?: z.ZodType;
  query?: z.ZodType;
  responses: Record<number, { description: string; schema: z.ZodType }>;
}

const routes: RouteDoc[] = [
  {
    method: "get",
    path: "/health",
    summary: "Check API and database health.",
    responses: {
      200: { description: "API is healthy.", schema: healthResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "post",
    path: "/auth/otp/request",
    summary: "Create an email OTP.",
    requestBody: otpRequestBodySchema,
    responses: {
      200: { description: "OTP created.", schema: otpRequestResponseSchema },
      400: { description: "Email is missing or invalid.", schema: errorResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "post",
    path: "/auth/otp/verify",
    summary: "Verify an email OTP.",
    requestBody: otpVerifyBodySchema,
    responses: {
      200: { description: "OTP verified.", schema: otpVerifyResponseSchema },
      400: { description: "Email or OTP is missing.", schema: errorResponseSchema },
      401: { description: "OTP is invalid.", schema: errorResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "get",
    path: "/account",
    summary: "Read the loyalty account state for an email.",
    query: accountQuerySchema,
    responses: {
      200: { description: "Account state.", schema: accountResponseSchema },
      400: { description: "Email is missing or invalid.", schema: errorResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "post",
    path: "/webhooks/patch/contact-updated",
    summary: "Consume a PATCH contact update webhook.",
    requestBody: patchContactUpdatedBodySchema,
    responses: {
      202: { description: "Webhook accepted.", schema: acceptedResponseSchema },
      401: { description: "Webhook auth failed.", schema: errorResponseSchema },
      400: { description: "Webhook payload is invalid.", schema: errorResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "post",
    path: "/webhooks/patch/reward-code",
    summary: "Consume a PATCH reward code webhook.",
    requestBody: patchRewardCodeBodySchema,
    responses: {
      202: { description: "Webhook accepted.", schema: acceptedResponseSchema },
      401: { description: "Webhook auth failed.", schema: errorResponseSchema },
      400: { description: "Webhook payload is invalid.", schema: errorResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "post",
    path: "/webhooks/roller/booking",
    summary: "Consume a ROLLER booking webhook and acknowledge non-retryable payload issues.",
    requestBody: rollerBookingBodySchema,
    responses: {
      202: { description: "Webhook accepted.", schema: acceptedResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  },
  {
    method: "post",
    path: "/webhooks/roller/signed-waiver",
    summary: "Consume a ROLLER signed waiver webhook and acknowledge non-retryable payload issues.",
    requestBody: rollerSignedWaiverBodySchema,
    responses: {
      202: { description: "Webhook accepted.", schema: acceptedResponseSchema },
      500: { description: "Unexpected server error.", schema: errorResponseSchema }
    }
  }
];

/**
 * Generates the full OpenAPI document used by `/openapi/openapi.json`.
 * Returns `object` intentionally because the assembled schema map is
 * runtime-generated from route metadata instead of a fixed interface.
 */
export function createOpenApiDocument(): object {
  const paths: Record<string, Record<string, object>> = {};

  for (const route of routes) {
    paths[route.path] ??= {};
    paths[route.path][route.method] = createOperation(route);
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Loyalty Demo API",
      version: "0.1.0"
    },
    paths
  };
}

/**
 * Builds one OpenAPI operation object from a route definition.
 * Keeps the return type broad because the generated shape mixes
 * query params, request body, and response schemas dynamically.
 */
function createOperation(route: RouteDoc): object {
  return {
    summary: route.summary,
    ...(route.query ? { parameters: createQueryParameters(route.query) } : {}),
    ...(route.requestBody
      ? {
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: toOpenApiSchema(route.requestBody)
              }
            }
          }
        }
      : {}),
    responses: Object.fromEntries(
      Object.entries(route.responses).map(([status, response]) => [
        status,
        {
          description: response.description,
          content: {
            "application/json": {
              schema: toOpenApiSchema(response.schema)
            }
          }
        }
      ])
    )
  };
}

/**
 * Converts a Zod query schema into OpenAPI query parameter entries.
 * The output remains loosely typed because `z.toJSONSchema` returns
 * generic object structures at runtime.
 */
function createQueryParameters(schema: z.ZodType): object[] {
  const jsonSchema = toOpenApiSchema(schema) as { properties?: Record<string, object>; required?: string[] };

  return Object.entries(jsonSchema.properties ?? {}).map(([name, propertySchema]) => ({
    name,
    in: "query",
    required: jsonSchema.required?.includes(name) ?? false,
    schema: propertySchema
  }));
}

/**
 * Converts a Zod schema into an OpenAPI 3.0-compatible JSON schema.
 * Uses `unrepresentable: "any"` so schemas with values not directly
 * representable in OpenAPI still produce a serializable document.
 */
function toOpenApiSchema(schema: z.ZodType): object {
  return z.toJSONSchema(schema, {
    target: "openapi-3.0",
    io: "input",
    unrepresentable: "any"
  }) as object;
}
