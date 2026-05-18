import { readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { openApiOutputPath } from "../../scripts/generate-openapi.js";

describe("OpenAPI generation", () => {
  it("writes the generated document under src/app/openapi", () => {
    expect(basename(openApiOutputPath)).toBe("openapi.json");
    expect(basename(dirname(openApiOutputPath))).toBe("openapi");
  });

  it("uses a Node 24 Docker base image", () => {
    const dockerfilePath = resolve(import.meta.dirname, "../../Dockerfile");
    const dockerfile = readFileSync(dockerfilePath, "utf8");

    expect(dockerfile).toContain("FROM node:24-alpine");
  });
});
