# AGENTS.md

## Project
Personal investment management app for monthly asset snapshots.

## Purpose
Build a maintainable portfolio management application that lets a user record monthly holdings and review current status, allocation, and month-over-month changes.

This is **not** a trading system and **not** a real-time brokerage integration product.
The first version is a **manual monthly snapshot** app.

---

## Product Scope
The app manages the following data:

- User name
- Account
- Country / market
- Asset category
- Asset name
- Currency
- Amount
- Return rate
- Snapshot month
- Optional memo

Examples:

- Account: `CMA`, `PENSION_SAVINGS`, `IRP`, `DC_PENSION`
- Market: `KR`, `US`
- Asset category: `STOCK`, `ETF`, `BOND`, `ELB`, `TDF`
- Currency: `KRW`, `USD`

---

## Non-Goals for MVP
Do **not** add these unless explicitly requested:

- Real-time market price sync
- Broker API integration
- Complex tax calculation
- Full transaction ledger accounting
- OAuth / social login
- Mobile app
- Multi-user org/team features
- AI recommendation engine
- Excessive animation / fancy dashboard effects

---

## Preferred Stack
Use this stack unless the repository already established a different pattern:

- Next.js (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Prisma
- SQLite for MVP
- Zod
- Recharts
- TanStack Table if table complexity grows

If a backend is needed inside the same app, prefer:

- Next.js Route Handlers
- Server Actions when appropriate and simple

---

## Architecture Principles

1. **Snapshot-first architecture**
   - Model monthly asset snapshots first.
   - Do not start with transaction-ledger complexity.

2. **Simple relational model**
   - `User`
   - `Account`
   - `AssetSnapshot`

3. **Explicit enums**
   Centralize enum values and keep them aligned across:
   - Prisma schema
   - validation schemas
   - UI select options

4. **Original currency storage**
   - Store amount in the original currency.
   - Do not auto-convert currency in MVP.
   - FX conversion can be added later.

5. **Aggregation as pure logic**
   - Put aggregation/comparison logic into pure utility functions.
   - Keep DB access separate from aggregation logic.

6. **Minimal file churn**
   - Change the fewest files possible.
   - Avoid broad refactors.

---

## Core Entities

### User
Minimum fields:
- `id`
- `name`

### Account
Minimum fields:
- `id`
- `userId`
- `name`
- `accountType`

### AssetSnapshot
Minimum fields:
- `id`
- `userId`
- `accountId`
- `snapshotMonth` (`YYYY-MM`)
- `market`
- `assetCategory`
- `assetName`
- `currency`
- `amount`
- `returnRate`
- `memo`
- `createdAt`
- `updatedAt`

---

## Data Rules

### snapshotMonth
- Format: `YYYY-MM`
- Must be validated
- Used as the main reporting unit

### amount
- Store the original entered amount
- Must be non-negative unless negative values are explicitly requested later
- Use decimal-safe storage where supported

### returnRate
- Percentage value
- Precision: two decimal places
- Example: `12.34`, `-5.67`

### Duplicates
Default rule:
- Allow multiple snapshot rows for the same month if asset/account combination differs
- Prevent accidental exact duplicates when practical

Recommended uniqueness direction for later enforcement:
- `userId + accountId + snapshotMonth + assetName + assetCategory + currency`

### Memo
- Optional
- Keep short and plain text

---

## UX Principles

- Keep the product calm, readable, and practical.
- Prioritize data clarity over visual flair.
- A dashboard, form, and list view are enough for MVP.
- Avoid complex interactions unless they remove meaningful user friction.
- Prefer conventional layouts over novelty.

### MVP Screens
1. Dashboard
2. Snapshot List
3. Snapshot Create/Edit Form
4. Monthly Comparison View

---

## Dashboard Requirements
Support a selected month and show:

- Total assets
- Assets by account
- Assets by market
- Assets by asset category
- Top assets by amount
- Month-over-month delta versus previous month

If no previous month exists:
- show a clear fallback state
- do not fabricate comparison values

---

## Filtering Requirements
Support filters for:

- snapshotMonth
- account
- market
- assetCategory
- currency
- keyword by assetName

Default list sort:
- amount descending

Keep filter state in URL query params if reasonably simple.

---

## Coding Rules

- Always propose a short plan before implementing non-trivial tasks.
- Make the smallest safe change.
- Do not rewrite whole files unless necessary.
- Reuse established patterns already in the repo.
- Keep functions short and cohesive.
- Prefer composition over premature abstraction.
- Avoid `any`.
- Keep TypeScript strict.
- Use descriptive names.
- Do not introduce state libraries unless there is a clear need.

### Validation
- Use Zod for request/form validation.
- Validate all user inputs.
- Keep validation schemas near their domain code.

### DB and Queries
- Prisma schema is the source of truth.
- Keep queries straightforward.
- Prefer server-side filtering for data-heavy list views.

### Utilities
Create reusable pure functions for:
- totals
- grouping
- percentage display formatting
- month-over-month comparison
- list filter normalization

---

## UI Rules

- Use simple card + table + form patterns.
- Keep spacing generous and text readable.
- Avoid modal-heavy UX unless necessary.
- Do not add animation unless requested.
- Use charts only where they clarify allocation or change.
- Prefer accessibility and clarity over decoration.

---

## Testing Rules

Add tests when business logic changes.
Focus tests on:

- aggregation
- month-over-month comparison
- validation schemas
- filter normalization

Do not add excessive boilerplate or snapshot-heavy UI tests unless explicitly requested.

---

## Performance Rules

For MVP:
- optimize for maintainability first
- keep DB queries simple
- avoid overengineering

If a page computes multiple summaries:
- fetch the minimum required dataset
- aggregate in tested utilities

---

## Output Style for Codex
When responding during implementation:

1. Give a short plan first for non-trivial work
2. Then implement only the current task
3. Be concise
4. Return:
   - summary
   - changed files
   - key decisions
5. Do not produce long essays
6. Do not refactor unrelated code

---

## Task Execution Rules
When given a feature request:

1. Restate it briefly in implementation terms
2. Identify affected layers:
   - schema
   - validation
   - server action / route
   - UI
   - tests
3. Change only those layers that are necessary
4. Verify the feature against the done criteria

---

## Definition of Done
A task is done when:

- feature behavior matches the request
- build is not broken
- type safety is preserved
- lint is not made worse
- validation exists where needed
- affected business logic has lightweight tests
- no unrelated refactor was introduced

---

## Default Build Priorities
Prioritize work in this order:

1. Schema correctness
2. Validation correctness
3. CRUD correctness
4. Aggregation correctness
5. Comparison correctness
6. Usability polish
7. Visual polish

---

## Anti-Patterns to Avoid

- Building a full ledger/accounting engine too early
- Mixing DB logic with aggregation logic everywhere
- Repeating enum values in multiple places without centralization
- Storing mixed-currency values as if they are directly comparable without labeling
- Over-designing the UI before the core flows work
- Massive refactors during feature work
- Long, token-heavy responses when a concise diff-focused response is enough

---

## Short Instruction Template for Future Tasks
Use this behavior by default:

- Plan first
- Keep the change minimal
- Preserve current architecture
- Prefer pure utilities for calculations
- Keep output concise
- Add tests for business logic
