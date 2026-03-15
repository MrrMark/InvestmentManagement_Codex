# tasks.md

## Project Goal
Build an MVP for a personal investment management application based on monthly asset snapshots.

This file is the execution checklist for implementation.
Each task should be completed with **minimal file churn**, **clear done criteria**, and **small reviewable changes**.

---

## Delivery Principles

- Complete one small task at a time.
- Always plan before non-trivial implementation.
- Prefer the smallest safe change.
- Keep business logic separated from UI where practical.
- Add lightweight tests for calculations and validation.
- Do not do unrelated refactors.

---

## Phase 0 — Repository Setup

### T0-1 Initialize app foundation
**Goal**
Set up the baseline application shell.

**Tasks**
- Initialize Next.js app with TypeScript and Tailwind CSS
- Ensure strict TypeScript mode
- Add base app layout
- Add simple navigation shell

**Done when**
- app runs locally
- routes load successfully
- base layout is in place

---

### T0-2 Add core dependencies
**Goal**
Install only the dependencies required for MVP.

**Tasks**
- Add Prisma
- Add SQLite support
- Add Zod
- Add Recharts
- Add test tooling appropriate for utility testing

**Done when**
- dependencies install cleanly
- app still builds

---

### T0-3 Create repository guidance files
**Goal**
Provide implementation guidance for Codex and future contributors.

**Tasks**
- Add `AGENTS.md`
- Add `PRD.md`
- Add `tasks.md`

**Done when**
- files exist at repo root
- guidance is aligned with MVP scope

---

## Phase 1 — Data Model and Persistence

### T1-1 Define Prisma schema
**Goal**
Create the initial relational model.

**Tasks**
- Create `User` model
- Create `Account` model
- Create `AssetSnapshot` model
- Add enums for account type, market, asset category, currency
- Set sensible field types and timestamps

**Done when**
- Prisma schema validates
- schema matches PRD

---

### T1-2 Add initial migration
**Goal**
Create the first working database migration.

**Tasks**
- Generate migration
- Verify schema can be applied locally

**Done when**
- migration succeeds
- DB file is created correctly

---

### T1-3 Add seed data
**Goal**
Make local development easier with sample records.

**Tasks**
- Seed one user
- Seed several accounts
- Seed sample snapshots across at least 2 months
- Include KRW and USD examples
- Include multiple asset categories

**Done when**
- seed command runs successfully
- sample data appears in DB

---

## Phase 2 — Domain Validation and Utility Foundations

### T2-1 Create centralized enums/constants
**Goal**
Keep enum usage consistent across the app.

**Tasks**
- Create domain constants shared by UI and validation
- Align values with Prisma enums

**Done when**
- enums are not duplicated ad hoc across the codebase

---

### T2-2 Add Zod schemas
**Goal**
Validate input for snapshot CRUD.

**Tasks**
- Add create snapshot schema
- Add update snapshot schema
- Validate snapshotMonth format
- Validate numeric fields

**Done when**
- invalid payloads are rejected
- valid payloads parse cleanly

---

### T2-3 Add aggregation utilities
**Goal**
Create pure functions for dashboard logic.

**Tasks**
- total assets for a month
- totals by account
- totals by market
- totals by asset category
- top holdings by amount

**Done when**
- utilities are independent of UI
- utilities are easy to test

---

### T2-4 Add comparison utilities
**Goal**
Create pure functions for month-over-month analysis.

**Tasks**
- total delta
- delta by account
- delta by market
- delta by asset category
- previous-month fallback handling

**Done when**
- comparison logic is reusable
- no duplicated comparison code exists in components

---

### T2-5 Add utility tests
**Goal**
Protect core business logic.

**Tasks**
- tests for aggregation utilities
- tests for comparison utilities
- tests for validation schemas where helpful

**Done when**
- core utility tests pass
- happy path and basic edge cases are covered

---

## Phase 3 — Basic App Structure and Navigation

### T3-1 Create main navigation
**Goal**
Provide the app’s basic information architecture.

**Tasks**
- Add navigation links for Dashboard, Snapshots, Add Snapshot, Compare
- Add page shell and section headings

**Done when**
- user can move between main routes

---

### T3-2 Create empty state patterns
**Goal**
Handle no-data scenarios cleanly.

**Tasks**
- dashboard empty state
- snapshot list empty state
- compare empty state

**Done when**
- no page looks broken when DB is empty

---

## Phase 4 — Snapshot CRUD

### T4-1 Implement snapshot create flow
**Goal**
Allow a user to add monthly holdings.

**Tasks**
- create add-snapshot page
- render form fields
- validate input
- save to DB

**Done when**
- valid form saves data
- invalid form shows errors

---

### T4-2 Implement snapshot edit flow
**Goal**
Allow correction of saved snapshot rows.

**Tasks**
- prefill existing record
- validate updates
- persist changes

**Done when**
- user can edit and save a row successfully

---

### T4-3 Implement snapshot delete flow
**Goal**
Allow removal of incorrect records.

**Tasks**
- add delete action
- add minimal confirmation UI

**Done when**
- row can be deleted safely

---

## Phase 5 — Snapshot List and Filters

### T5-1 Build snapshot list page
**Goal**
Show all snapshot rows in a readable table.

**Tasks**
- fetch snapshot records
- render tabular view
- show key fields clearly
- default sort by amount descending

**Done when**
- list page loads and displays records correctly

---

### T5-2 Add list filters
**Goal**
Allow slicing data on the list page.

**Tasks**
- filter by snapshotMonth
- filter by account
- filter by market
- filter by asset category
- filter by currency
- search by assetName keyword

**Done when**
- filters work in combination
- results update correctly

---

### T5-3 Persist filter state in URL
**Goal**
Make filtered views shareable and stable.

**Tasks**
- map filters to query params
- parse query params into filter state
- normalize invalid or missing values safely

**Done when**
- refreshing the page preserves filter state
- URL reflects active filters

---

## Phase 6 — Dashboard

### T6-1 Create selected month dashboard
**Goal**
Show a useful monthly overview.

**Tasks**
- add selected month control
- show total assets
- show totals by account
- show totals by market
- show totals by asset category
- show top holdings

**Done when**
- dashboard values match source data for the selected month

---

### T6-2 Add simple charts
**Goal**
Improve readability of allocation data.

**Tasks**
- add at least one allocation chart
- keep chart usage minimal and clear
- label values clearly

**Done when**
- charts improve understanding without clutter

---

## Phase 7 — Month-over-Month Comparison

### T7-1 Create comparison page
**Goal**
Show what changed since the previous month.

**Tasks**
- choose selected month
- derive previous month
- show total delta
- show delta by account
- show delta by market
- show delta by asset category

**Done when**
- user can review monthly changes accurately

---

### T7-2 Handle missing previous month data
**Goal**
Avoid misleading comparison behavior.

**Tasks**
- define fallback state
- show clear messaging
- avoid fake zero-comparison assumptions unless intentionally designed

**Done when**
- compare page behaves safely when prior data is missing

---

## Phase 8 — UX and Quality Improvements

### T8-1 Improve form usability
**Goal**
Reduce repetitive input friction.

**Tasks**
- improve select defaults where sensible
- keep labels and helper text concise
- format numeric inputs clearly

**Done when**
- form feels faster to use without becoming complex

---

### T8-2 Add formatting helpers
**Goal**
Standardize visual display of business values.

**Tasks**
- currency display helper
- return rate display helper
- month label formatter

**Done when**
- values display consistently across pages

---

### T8-3 Add loading and error states
**Goal**
Make async flows resilient and understandable.

**Tasks**
- loading states for data pages
- save error state for forms
- recoverable user messaging

**Done when**
- major pages handle common async states cleanly

---

## Phase 9 — Optional Next-Step Features (Post-MVP)

### T9-1 CSV import
**Goal**
Allow bulk monthly input.

**Tasks**
- CSV upload
- row parsing
- preview table
- row-level validation errors
- import valid rows

**Done when**
- user can import a CSV safely

---

### T9-2 CSV export
**Goal**
Allow local backup and external analysis.

**Tasks**
- export filtered snapshot rows
- preserve meaningful column names

**Done when**
- exported file reflects current filtered view or selected month

---

### T9-3 FX conversion support
**Goal**
Enable normalized portfolio totals.

**Tasks**
- add fx rate input source
- define conversion strategy
- show converted totals separately from raw currency totals

**Done when**
- converted totals are explicit and not confused with raw values

---

## Engineering Checklists

### For Any Schema Change
- update Prisma schema
- create migration if needed
- update Zod schemas
- update seed data if needed
- verify affected UI
- add/update tests

### For Any Business Logic Change
- isolate logic in utilities when possible
- add/update tests
- verify no UI duplicates the logic elsewhere

### For Any New Page
- handle loading state
- handle empty state
- handle error state
- verify navigation link if applicable

---

## Recommended Build Order

1. T0-1 to T0-3
2. T1-1 to T1-3
3. T2-1 to T2-5
4. T3-1 to T3-2
5. T4-1 to T4-3
6. T5-1 to T5-3
7. T6-1 to T6-2
8. T7-1 to T7-2
9. T8-1 to T8-3
10. T9-x as needed

---

## Definition of Project MVP Done
The MVP is done when all of the following are true:

- snapshot CRUD works
- list page and filters work
- dashboard renders correct monthly summaries
- month-over-month comparison works
- validation blocks bad input
- sample data exists for development
- core business logic has lightweight automated tests
- app remains simple and maintainable
