export function createPageHtml(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; background: #f4f6f8; color: #17212b; }
    main { max-width: 760px; margin: 32px auto; background: #fff; border: 1px solid #dde3ea; border-radius: 8px; padding: 20px; }
    h1 { font-size: 1.45rem; margin: 0 0 8px; }
    h2 { font-size: 1rem; margin: 0 0 8px; }
    p { margin: 0 0 14px; color: #45576a; }
    form { display: grid; gap: 10px; }
    label { display: grid; gap: 4px; font-size: 0.95rem; }
    input { font: inherit; padding: 10px; border: 1px solid #c5ced8; border-radius: 6px; }
    button { font: inherit; padding: 10px 14px; border: 0; border-radius: 6px; background: #0f5bb8; color: #fff; cursor: pointer; }
    section { border-top: 1px solid #edf1f5; padding-top: 14px; margin-top: 14px; }
    ul { margin: 0; padding-left: 18px; color: #243241; }
    li { margin: 4px 0; }
    a { color: #0f5bb8; }
    .topline { display: flex; justify-content: space-between; gap: 16px; align-items: start; }
    .metric { font-size: 1.6rem; color: #17212b; font-weight: 700; }
  </style>
</head>
<body>
  <main>${body}</main>
</body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderList(items: unknown[], renderItem: (item: unknown) => string): string {
  if (items.length === 0) {
    return "<p>None yet.</p>";
  }

  return `<ul>${items.map((item) => `<li>${renderItem(item)}</li>`).join("")}</ul>`;
}
