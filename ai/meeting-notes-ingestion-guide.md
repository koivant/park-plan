# Meeting Notes Ingestion Guide (AI Helper)

Use this guide whenever new meeting notes are received.

## Input expected

1. Raw bullet notes from meeting.
2. Meeting date (or best estimate).
3. Any explicit deadlines and owners.

## Output required

1. Create a dated file in `docs/ops/meetings/`.
2. Normalize raw notes into clear bullets.
3. Extract action items with tentative owners (if available).
4. Update:
   - `docs/ops/tracking/progress-board.md`
   - `docs/03-implementation/decisions.md` (for new decisions/open questions)
   - `docs/03-implementation/verification-and-open-items.md` (if new external facts were added)
5. Flag date ambiguities with absolute date assumptions.

## Formatting rules

1. Keep wording factual and concise.
2. Preserve original meaning; do not invent commitments.
3. Mark assumptions explicitly as `ASSUMPTION`.

## Quality checks before finalizing

1. All deadlines converted to exact dates.
2. Every open question appears either in decision log or progress board.
3. Every technical claim has a source link if sourced externally.
