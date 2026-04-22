# AGENTS.md

Documentation rules for this repo:

- Keep docs split by purpose:
  - `docs/qa`: Q&A docs (`*-qa.md`).
  - `docs/runbooks`: step-by-step operational docs (`*-runbook.md`).
  - `docs/guides`: decision docs, summaries, matrices, support-gap docs.
  - `docs/ai`: AI-only helper docs, indexing docs, working notes.
- Do not use numeric prefixes in doc filenames.
- Do not use dates in doc filenames.
- Do not create reading-order/index-guide files in `docs/qa`, `docs/runbooks`, or `docs/guides`.
- If an AI indexing/helper file is needed, place it only in `docs/ai`.
- After renames/moves, update all internal links.
- Keep docs brief by default:
  - Prefer key decisions, open items, and action steps only.
  - Remove repeated rationale and long background text.
  - Use short sections and flat bullets.
  - Keep one source list per document instead of repeating sources after every line.
- Country list handling:
  - Keep country names in `docs/data/countries.txt` as source of truth.
  - Do not repeat full country lists in QA/guides/runbooks/AI docs; reference the source file.
- AI doc path handling:
  - In `docs/ai`, avoid exact file paths.
  - When referencing files, use approximate location wording (for example: "in the data folder").
- Payment decision handling:
  - Do not assume ROLLER Payments as global default.
  - Frame payment selection as a country-by-country decision.
- General execution rules:
  - Follow requested structure exactly (row/column orientation, file name, delimiter, section layout).
  - Separate template creation from content population:
    - If user asks to create/format a table or CSV structure, do not auto-populate values unless explicitly asked.
    - Add columns only when clearly needed to preserve mapping logic.
  - Treat "reindex" as sync-to-current-state only:
    - Re-scan current files and references.
    - Do not reconstruct deleted content from memory.
    - Do not redesign or repopulate files unless explicitly requested.
  - Prefer minimal edits:
    - Preserve user-managed file content and format.
    - Change only what the prompt asks; avoid opportunistic rewrites.
