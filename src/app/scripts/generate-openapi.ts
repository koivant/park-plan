import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createOpenApiDocument } from "../openapi.js";

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const openApiOutputPath = resolve(appDir, "openapi/openapi.json");

export function generateOpenApi(options: { check?: boolean } = {}): void {
  const generated = `${JSON.stringify(createOpenApiDocument(), null, 2)}\n`;

  if (options.check) {
    const current = existsSync(openApiOutputPath) ? readFileSync(openApiOutputPath, "utf8") : "";

    if (current !== generated) {
      console.error(`OpenAPI document is out of date: ${openApiOutputPath}`);
      process.exit(1);
    }

    return;
  }

  mkdirSync(dirname(openApiOutputPath), { recursive: true });
  writeFileSync(openApiOutputPath, generated);
  console.log(`Wrote ${openApiOutputPath}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateOpenApi({ check: process.argv.includes("--check") });
}
