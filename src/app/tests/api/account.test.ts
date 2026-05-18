import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { createDb, createResult } from "../helpers/db.js";

describe("Account API routes", () => {
  it("GET /account returns a default account when no customer exists", async () => {
    const db = createDb(() => createResult());
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/account").query({ email: "USER@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: "user@example.com",
      loyalty_points: 0,
      loyalty_target: null,
      home_park: null,
      visited_parks: [],
      profile: {
        email: "user@example.com"
      },
      upcoming_bookings: [],
      waivers: [],
      discount_codes: []
    });
  });

  it("GET /account returns the merged projection needed by the customer web view", async () => {
    const db = createDb(() =>
      createResult([
        {
          email: "user@example.com",
          loyalty_points: 7,
          loyalty_target: 10,
          home_park: {
            parkId: "69184",
            parkName: "SuperPark Vantaa"
          },
          visited_parks: [
            {
              parkId: "69184",
              parkName: "SuperPark Vantaa",
              firstSeenAt: "2026-05-01T09:00:00.000Z",
              lastSeenAt: "2026-05-03T09:00:00.000Z",
              visitCount: 2
            }
          ],
          profile: {
            email: "user@example.com",
            name: "Taylor Example",
            phone: "+358401234567"
          },
          upcoming_bookings: [
            {
              bookingId: "booking-1",
              venue: "SuperPark Vantaa",
              startsAt: "2026-05-02T10:00:00.000Z",
              ticketCount: 3,
              status: "confirmed"
            }
          ],
          waivers: [
            {
              waiverId: "waiver-1",
              status: "signed",
              documentUrl: "https://example.com/waivers/waiver-1.pdf"
            }
          ],
          discount_codes: [
            {
              code: "FREE-1",
              used: false,
              issuedAt: "2026-05-01T09:00:00.000Z",
              usedAt: null
            }
          ]
        }
      ])
    );
    const app = createApp({
      db,
      config: { nodeEnv: "development", magicLinkTtlSeconds: 600 }
    });

    const response = await request(app).get("/account").query({ email: "user@example.com" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      email: "user@example.com",
      loyalty_points: 7,
      loyalty_target: 10,
      home_park: {
        parkId: "69184",
        parkName: "SuperPark Vantaa"
      },
      visited_parks: [
        {
          parkId: "69184",
          parkName: "SuperPark Vantaa",
          firstSeenAt: "2026-05-01T09:00:00.000Z",
          lastSeenAt: "2026-05-03T09:00:00.000Z",
          visitCount: 2
        }
      ],
      profile: {
        email: "user@example.com",
        name: "Taylor Example",
        phone: "+358401234567"
      },
      upcoming_bookings: [
        {
          bookingId: "booking-1",
          venue: "SuperPark Vantaa",
          startsAt: "2026-05-02T10:00:00.000Z",
          ticketCount: 3,
          status: "confirmed"
        }
      ],
      waivers: [
        {
          waiverId: "waiver-1",
          status: "signed",
          documentUrl: "https://example.com/waivers/waiver-1.pdf"
        }
      ],
      discount_codes: [
        {
          code: "FREE-1",
          used: false,
          issuedAt: "2026-05-01T09:00:00.000Z",
          usedAt: null
        }
      ]
    });
  });
});
