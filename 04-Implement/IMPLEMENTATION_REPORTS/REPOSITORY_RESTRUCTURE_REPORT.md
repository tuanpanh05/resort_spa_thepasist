# Repository Restructure Report

## What was changed
The repository was reorganized to align with the standard AI-Driven Development structure:
- `00-Policy`: Contains all rules.
- `01-Planning`: Contains project plans.
- `02-Requirement`: Contains SRS and BRDs.
- `03-Design`: Contains SDS and diagrams.
- `04-Implement`: Contains implementation logs.
- `05-Development`: Contains all source code (`backend` and `frontend`), infrastructure scripts, and database schema.
- `06-Testing`: Contains test cases, plans, and reports.
- `07-Reports`: Contains all sprint and weekly reports.
- `08-Document-References`: Contains templates and supporting files.

## Why it was changed
To establish a professional, standard folder structure that supports AI agents reading rules before coding, safely tracking progress, and ensuring clean separation of concerns.

## Files moved
- `Backend` -> `05-Development/backend`
- `frontend` -> `05-Development/frontend`
- All contents inside `docs` were scattered into the numbered folders matching their functional roles.

## Recommended next steps
- Update any external CI/CD pipelines (e.g., GitHub Actions) to point to the new paths inside `05-Development/`.
- Validate full deployment cycle locally before committing these structural changes to `main`.
