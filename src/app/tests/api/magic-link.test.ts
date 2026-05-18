import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../app.js";
import { createDb, createResult } from "../helpers/db.js";

describe("Magic-link API routes", () => {
  it("POST /auth/magic-link/request validates email and creates a token for an existing customer", async () => {
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

    const response = await request(app).post("/auth/magic-link/request").send({ email: " USER@Example.COM " });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.message).toBe("If an account exists, a sign-in link has been sent.");
    expect(response.body.demoMagicLink).toBe("http://localhost:3000/auth/magic-link?token=magic-token");
    expect(db.calls[0].params?.[0]).toBe("user@example.com");
    expect(db.calls[1].text).toContain("insert into magic_link_tokens");
    expect(db.calls[1].params?.[0]).toBe("customer-id");
    expect(db.calls[1].params?.[2]).toEqual(new Date("2026-01-01T00:10:00.000Z"));
  });

  it("POST /auth/magic-link/request logs a mock email with the login link in development", async () => {
    const db = createDb((text) => {
      if (text.includes("from customers")) {
        return createResult([{ id: "customer-id" }], 1);
      }

      return createResult();
    });
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600, loyaltyAppBaseUrl: "http://localhost:3000" },
      randomMagicToken: () => "magic-token"
    });
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    await request(app).post("/auth/magic-link/request").send({ email: "user@example.com" });

    expect(consoleInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "mock_email",
        to: "user@example.com",
        subject: "Your SuperPark loyalty login link",
        magicLink: "http://localhost:3000/auth/magic-link?token=magic-token"
      })
    );

    consoleInfo.mockRestore();
  });

  it("POST /auth/magic-link/request does not create a token when the email is unknown", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 },
      randomMagicToken: () => "magic-token"
    });

    const response = await request(app).post("/auth/magic-link/request").send({ email: "missing@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      message: "If an account exists, a sign-in link has been sent."
    });
    expect(db.calls).toHaveLength(1);
    expect(db.calls[0].text).toContain("from customers");
  });

  it("POST /auth/magic-link/request rejects missing email", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).post("/auth/magic-link/request").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "email_required" });
    expect(db.calls).toHaveLength(0);
  });

  it("GET /auth/magic-link returns a session token for a valid token", async () => {
    const db = createDb(() => createResult([{ id: "magic-link-id", customer_id: "customer-id" }], 1));
    const app = createApp({
      db,
      randomUUID: () => "session-token"
    });

    const response = await request(app).get("/auth/magic-link").query({ token: "magic-token" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, sessionToken: "session-token" });
    expect(db.calls[0].text).toContain("update magic_link_tokens");
    expect(db.calls[0].params?.[0]).toBeDefined();
  });

  it("GET /auth/magic-link rejects an invalid token", async () => {
    const db = createDb(() => createResult([], 0));
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/auth/magic-link").query({ token: "invalid-token" });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "invalid_magic_link" });
  });

  it("GET /auth/magic-link redirects browser users to the account view with a session cookie", async () => {
    const db = createDb(() => createResult([{ id: "magic-link-id", customer_id: "customer-id" }], 1));
    const app = createApp({
      db,
      randomUUID: () => "session-token"
    });

    const response = await request(app).get("/auth/magic-link").set("Accept", "text/html").query({ token: "magic-token" });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/account-view");
    expect(response.headers["set-cookie"][0]).toContain("lp_session=session-token");
  });

  it("GET /account-view renders a minimal customer account page for a valid session", async () => {
    const db = createDb((text) => {
      if (text.includes("update magic_link_tokens")) {
        return createResult([{ id: "magic-link-id", customer_id: "customer-id" }], 1);
      }

      if (text.includes("where c.id = $1")) {
        return createResult([
          {
            email: "user@example.com",
            loyalty_points: 7,
            loyalty_target: 10,
            home_park: { parkId: "vantaa", parkName: "SuperPark Vantaa" },
            visited_parks: [{ parkId: "vantaa", parkName: "SuperPark Vantaa", visitCount: 2 }],
            profile: { email: "user@example.com", name: "Taylor Example", phone: "+358401234567" },
            upcoming_bookings: [{ bookingId: "booking-1", venue: "SuperPark Vantaa", startsAt: "2026-05-02T10:00:00.000Z", ticketCount: 3 }],
            waivers: [{ status: "signed" }],
            discount_codes: [{ code: "FREE-1", used: false }]
          }
        ]);
      }

      return createResult();
    });
    const app = createApp({
      db,
      randomUUID: () => "session-token"
    });
    const agent = request.agent(app);

    await agent.get("/auth/magic-link").set("Accept", "text/html").query({ token: "magic-token" });
    const response = await agent.get("/account-view");

    expect(response.status).toBe(200);
    expect(response.text).toContain("Taylor Example");
    expect(response.text).toContain("7 / 10 stamps");
    expect(response.text).toContain("SuperPark Vantaa");
    expect(response.text).toContain("FREE-1");
    expect(response.text).toContain("Log out");
  });

  it("POST /logout clears the session and redirects to the mock home park front page", async () => {
    const db = createDb((text) => {
      if (text.includes("update magic_link_tokens")) {
        return createResult([{ id: "magic-link-id", customer_id: "customer-id" }], 1);
      }

      if (text.includes("where c.id = $1")) {
        return createResult([
          {
            email: "user@example.com",
            loyalty_points: 7,
            loyalty_target: 10,
            home_park: { parkId: "vantaa", parkName: "SuperPark Vantaa" },
            visited_parks: [],
            profile: { email: "user@example.com", name: "Taylor Example" },
            upcoming_bookings: [],
            waivers: [],
            discount_codes: []
          }
        ]);
      }

      return createResult();
    });
    const app = createApp({
      db,
      randomUUID: () => "session-token"
    });
    const agent = request.agent(app);

    await agent.get("/auth/magic-link").set("Accept", "text/html").query({ token: "magic-token" });
    const response = await agent.post("/logout");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/mock/home-park?parkId=vantaa&parkName=SuperPark+Vantaa");
    expect(response.headers["set-cookie"][0]).toContain("lp_session=;");
  });
});
