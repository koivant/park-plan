import type express from "express";

export function wantsHtml(req: express.Request): boolean {
  const accept = req.headers.accept;
  return typeof accept === "string" && accept.includes("text/html") && !req.is("application/json");
}
