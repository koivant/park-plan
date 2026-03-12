# Reusable Prompt: Process New Meeting Notes

Use this prompt with AI when new owner/team notes arrive:

```text
Process the following meeting notes into this planning repository.

Required actions:
1) Create a new file under docs/ops/meetings/YYYY-MM-DD-<short-title>.md
2) Normalize raw notes into clear bullets.
3) Extract actions and open decisions.
4) Update docs/ops/tracking/progress-board.md with status changes.
5) Update docs/03-implementation/decisions.md with new OPEN/LOCKED decisions.
6) If external facts were added, update docs/03-implementation/verification-and-open-items.md with source URLs.
7) If any deadline is ambiguous, write an explicit ASSUMPTION with exact date and ask for confirmation.

Keep output concise and planning-focused. Do not generate implementation code.
```
