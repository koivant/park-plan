import type express from "express";
import { httpConfig } from "../config.js";

export function setSessionCookie(res: express.Response, sessionToken: string): void {
  res.setHeader(
    "Set-Cookie",
    `${httpConfig.cookies.sessionName}=${encodeURIComponent(sessionToken)}; Path=${httpConfig.cookies.path}; HttpOnly; SameSite=${httpConfig.cookies.sameSite}`
  );
}

export function clearSessionCookie(res: express.Response): void {
  res.setHeader(
    "Set-Cookie",
    `${httpConfig.cookies.sessionName}=; Path=${httpConfig.cookies.path}; HttpOnly; SameSite=${httpConfig.cookies.sameSite}; Max-Age=${httpConfig.cookies.clearMaxAge}`
  );
}

export function readCookie(req: express.Request, name: string): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return undefined;
}
