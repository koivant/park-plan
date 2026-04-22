# Glasgow Pilot Runbook

## Objective
Launch and validate the standalone loyalty app on GCP for Glasgow.

## Preconditions
- GCP project and environments ready.
- App service deployed to Cloud Run.
- PostgreSQL provisioned and schema applied.
- Redis cache provisioned in Memorystore and reachable from app.
- ROLLER API credentials and webhook configuration active.
- PATCH API account context and credentials active.
- Scheduler for reconciliation configured.

## Deployment Steps
1. Deploy app image to staging Cloud Run.
2. Apply DB migrations.
3. Configure secrets and provider credentials.
4. Register webhook endpoint in ROLLER.
5. Run smoke tests for login, account read, provider connectivity.
6. Promote to production environment.

## Validation Steps
1. Trigger booking creation in ROLLER and confirm account update.
2. Trigger waiver signing and confirm waiver update.
3. Confirm loyalty data from PATCH appears in account view.
4. Confirm reconciliation job catches delayed/missed updates.
5. Confirm cache invalidation and repopulation on account-changing events.

## Rollback
1. Route traffic away from current revision.
2. Pause webhook ingestion endpoint.
3. Keep event log for replay.
4. Restore previous stable revision.
