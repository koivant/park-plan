/** Builds the local Swagger UI HTML shell. */
export function createDocsHtml(specUrl: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Loyalty Demo API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html, body, #swagger-ui {
        height: 100%;
        margin: 0;
      }

      body {
        background: #faf8f1;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "${specUrl}",
        dom_id: "#swagger-ui"
      });
    </script>
  </body>
</html>`;
}
