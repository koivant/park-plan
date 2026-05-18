import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { createDb, createResult } from "../helpers/db.js";

describe("Core API routes", () => {
  it("GET /openapi/openapi.json returns the OpenAPI document", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/openapi/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/health"]).toBeDefined();
    expect(response.headers["content-type"]).toContain("application/json");
  });

  it("GET /docs returns a browsable OpenAPI docs page", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/docs");

    expect(response.status).toBe(200);
    expect(response.text).toContain("SwaggerUIBundle");
    expect(response.text).toContain("/openapi/openapi.json");
    expect(response.text).toContain("<title>Loyalty Demo API Docs</title>");
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("GET /join returns a demo join form page", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/join");

    expect(response.status).toBe(200);
    expect(response.text).toContain("<form method=\"post\" action=\"/join\">");
    expect(response.text).toContain("name=\"email\"");
    expect(response.text).toContain("name=\"phone\"");
    expect(response.text).toContain("name=\"name\"");
    expect(response.text).not.toContain("name=\"rollerCustomerId\"");
    expect(response.text).not.toContain("name=\"patchContactId\"");
    expect(response.text).not.toContain("name=\"homeParkId\"");
    expect(response.headers["content-type"]).toContain("text/html");
  });

  it("POST /join creates a pending customer account when email and phone are not registered", async () => {
    const db = createDb((text, params) => {
      if (text.includes("where email = $1")) {
        return createResult([], 0);
      }

      if (text.includes("where phone = $1")) {
        return createResult([], 0);
      }

      if (text.includes("insert into customers")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      if (text.includes("set pending = $2")) {
        return createResult([], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/join").type("form").send({
      name: "Taylor Example",
      email: " TAYLOR@example.com ",
      phone: "+358 40 123 4567"
    });

    expect(response.status).toBe(200);
    expect(response.text).toContain("Account created");
    expect(response.text).toContain("pending");
    expect(response.text).toContain("customer-id");
    expect(
      db.calls.some(
        (call) =>
          call.text.includes("insert into customers") &&
          JSON.stringify(call.params) ===
            JSON.stringify([
              "taylor@example.com",
              "+358401234567",
              "Taylor Example",
              null,
              null,
              null,
              null
            ])
      )
    ).toBe(true);
    expect(db.calls.some((call) => call.text.includes("set pending = $2") && JSON.stringify(call.params) === JSON.stringify(["customer-id", true]))).toBe(true);
  });

  it("POST /join rejects duplicate signups when email already exists", async () => {
    const db = createDb((text) => {
      if (text.includes("where email = $1")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/join").type("form").send({
      name: "Taylor Example",
      email: "taylor@example.com",
      phone: "+358401234567"
    });

    expect(response.status).toBe(200);
    expect(response.text).toContain("already been signed up");
    expect(db.calls.some((call) => call.text.includes("insert into customers"))).toBe(false);
  });

  it("POST /join rejects duplicate signups when phone already exists", async () => {
    const db = createDb((text) => {
      if (text.includes("where email = $1")) {
        return createResult([], 0);
      }

      if (text.includes("where phone = $1")) {
        return createResult([{ id: "existing-customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/join").type("form").send({
      name: "Taylor Example",
      email: "taylor@example.com",
      phone: "+358401234567"
    });

    expect(response.status).toBe(200);
    expect(response.text).toContain("already been signed up");
    expect(db.calls.some((call) => call.text.includes("insert into customers"))).toBe(false);
  });

  it("logs request metadata for incoming REST calls", async () => {
    const db = createDb(() => createResult([{ now: new Date("2026-01-01T00:00:00.000Z") }]));
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "http_request",
        method: "GET",
        path: "/health",
        statusCode: 200
      })
    );
    expect(consoleInfo.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        durationMs: expect.any(Number)
      })
    );

    consoleInfo.mockRestore();
  });

  it("logs endpoint action and payload for REST calls", async () => {
    const db = createDb((text) => {
      if (text.includes("from customers")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 },
      now: () => new Date("2026-01-01T00:00:00.000Z"),
      randomMagicToken: () => "magic-token"
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).post("/auth/magic-link/request").send({ email: "user@example.com" });

    expect(response.status).toBe(200);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "http_request",
        method: "POST",
        path: "/auth/magic-link/request",
        action: "Create a one-time magic link for authentication",
        payload: {
          body: { email: "user@example.com" }
        }
      })
    );

    consoleInfo.mockRestore();
  });

  it("logs incoming webhook payloads on request start", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    const response = await request(app).post("/webhooks/roller/booking").send({
      type: "Booking",
      eventType: "Created",
      data: {
        bookingReference: "booking-1"
      }
    });

    expect(response.status).toBe(202);
    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "http_webhook_received",
        method: "POST",
        path: "/webhooks/roller/booking",
        action: "Ingest ROLLER booking webhook",
        payload: {
          body: {
            type: "Booking",
            eventType: "Created",
            data: {
              bookingReference: "booking-1"
            }
          }
        }
      })
    );

    consoleInfo.mockRestore();
  });

  it("GET /health returns database status", async () => {
    const db = createDb(() => createResult([{ now: new Date("2026-01-01T00:00:00.000Z") }]));
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      databaseTime: "2026-01-01T00:00:00.000Z"
    });
  });
});
