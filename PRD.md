# PRD.md

## 1. Product Overview

### Product Name
Monthly Asset Portfolio Manager

### One-line Summary
A personal investment management application that records monthly asset snapshots and shows current allocation, trends, and month-over-month changes.

### Product Type
Personal finance / investment tracking application

### Product Goal
Help a user manage and understand their asset status each month across different accounts, markets, and asset categories without requiring real-time brokerage integration.

---

## 2. Problem Statement

Individual investors often spread their assets across multiple account types such as CMA, pension savings, IRP, and DC pension accounts. They also hold assets across multiple markets like Korea and the U.S., and across asset categories such as stocks, ETFs, bonds, ELBs, and TDFs.

Because data is fragmented, users struggle to:

- see a clear monthly asset picture in one place
- compare changes month over month
- understand allocation by account, market, and product type
- maintain a simple, consistent record of holdings over time

Existing tools are often either:
- too complex
- overly focused on real-time trading
- dependent on integrations the user does not want to maintain

This product solves the problem with a **manual monthly snapshot model** that is simple, durable, and easy to operate.

---

## 3. Target User

### Primary User
A personal investor who wants a structured way to track assets monthly.

### User Characteristics
- uses multiple investment accounts
- invests in KR and/or US markets
- holds different asset types
- wants portfolio visibility rather than broker-grade execution tools
- values clarity, maintainability, and low-friction data entry

---

## 4. Product Principles

1. **Simple over complex**
   The product should be easy to understand and operate.

2. **Monthly snapshot over transaction ledger**
   The initial product should optimize for recurring portfolio reviews, not detailed trade accounting.

3. **Manual first, automation later**
   The first version should work well without external API dependencies.

4. **Readable data over flashy UI**
   Information architecture matters more than visual novelty.

5. **Extensible foundation**
   The MVP should leave room for CSV import, FX handling, and price integrations later.

---

## 5. In Scope for MVP

### Core Features
1. Create monthly asset snapshot entries
2. Edit and delete snapshot entries
3. View snapshot list
4. Filter snapshot list
5. Dashboard summary for a selected month
6. Month-over-month comparison
7. Seed/sample data for development

### Fields to Manage
- Name
- Account
- Country / market
- Asset category
- Asset name
- Currency
- Amount
- Return rate
- Snapshot month
- Memo (optional)

### Supported Example Values
#### Account
- CMA
- Pension Savings Fund
- IRP
- DC Pension

#### Market
- KR
- US

#### Asset Category
- STOCK
- ETF
- BOND
- ELB
- TDF

#### Currency
- KRW
- USD

---

## 6. Out of Scope for MVP

- real-time market data sync
- automatic FX rate sync
- brokerage login / scraping
- full buy/sell transaction history engine
- tax reporting
- dividend tracking automation
- multi-user collaboration
- advanced goal planning
- mobile-native app
- push notifications

---

## 7. User Stories

### Entry and Maintenance
- As a user, I want to record my holdings for a given month so that I can preserve a monthly history.
- As a user, I want to edit a saved entry so that I can correct mistakes.
- As a user, I want to delete an incorrect snapshot row so that the month’s data remains accurate.

### Visibility
- As a user, I want to see total assets for a selected month so that I can understand my current scale.
- As a user, I want to see assets grouped by account so that I can understand where my money is held.
- As a user, I want to see assets grouped by market so that I can understand regional exposure.
- As a user, I want to see assets grouped by asset category so that I can understand product allocation.

### Analysis
- As a user, I want to compare this month versus last month so that I can understand changes.
- As a user, I want to identify my largest holdings so that I can review concentration risk.

### Filtering
- As a user, I want to filter by month, account, market, asset category, and currency so that I can narrow down my view.
- As a user, I want keyword search by asset name so that I can find a holding quickly.

---

## 8. Functional Requirements

### FR-1 Snapshot CRUD
The system shall allow users to create, read, update, and delete asset snapshot rows.

Each snapshot row includes:
- user
- account
- snapshotMonth
- market
- assetCategory
- assetName
- currency
- amount
- returnRate
- memo

### FR-2 Validation
The system shall validate user input before persisting data.

Validation rules include:
- snapshotMonth must follow `YYYY-MM`
- assetName is required
- amount is required and numeric
- returnRate is numeric with up to 2 decimal places
- market must be one of supported values
- assetCategory must be one of supported values
- currency must be one of supported values

### FR-3 List View
The system shall provide a list view for asset snapshots.

The list view shall support:
- sorting by amount descending by default
- filtering by month
- filtering by account
- filtering by market
- filtering by asset category
- filtering by currency
- keyword search on assetName

### FR-4 Dashboard
The system shall provide a monthly dashboard for a selected snapshot month.

The dashboard shall display:
- total assets
- asset totals by account
- asset totals by market
- asset totals by asset category
- top holdings by amount

### FR-5 Month-over-Month Comparison
The system shall compare a selected month with the immediately previous month.

The comparison shall show:
- total delta
- delta by account
- delta by market
- delta by asset category

If previous month data does not exist:
- the system shall show an empty/fallback comparison state
- the system shall not produce misleading synthetic values

### FR-6 Data Persistence
The system shall persist data locally using a relational database suitable for MVP.

### FR-7 Seed Data
The system shall provide seed data or mock data for local development.

---

## 9. Non-Functional Requirements

### NFR-1 Maintainability
The codebase should be easy to understand and modify.

### NFR-2 Type Safety
Core domain logic should be strongly typed.

### NFR-3 Clarity
UI should prioritize readability and low cognitive load.

### NFR-4 Low Operational Dependency
The MVP should work without external financial APIs.

### NFR-5 Testability
Aggregation and comparison logic should be unit testable.

---

## 10. Information Architecture

### Primary Navigation
- Dashboard
- Snapshots
- Add Snapshot
- Compare

### Main Pages
#### Dashboard
Purpose:
- Monthly overview and allocation summary

#### Snapshots
Purpose:
- detailed table view with filtering and editing

#### Add / Edit Snapshot
Purpose:
- create and update snapshot rows

#### Compare
Purpose:
- month-over-month change analysis

---

## 11. Data Model

### Core Entities
#### User
- id
- name

#### Account
- id
- userId
- name
- accountType

#### AssetSnapshot
- id
- userId
- accountId
- snapshotMonth
- market
- assetCategory
- assetName
- currency
- amount
- returnRate
- memo
- createdAt
- updatedAt

### Key Modeling Decisions
- store original currency value
- do not normalize to KRW in MVP
- model monthly snapshots first
- keep enum values explicit and controlled

---

## 12. Success Metrics

### MVP Success Indicators
- user can record a month’s holdings without confusion
- user can review total assets and allocation for a month
- user can compare one month to the previous month
- user can find and edit snapshot rows quickly
- core workflow feels stable and low-friction

### Engineering Success Indicators
- schema is stable
- business logic is testable
- feature development remains incremental
- Codex-assisted development can proceed with low token waste

---

## 13. Risks and Mitigations

### Risk 1: Scope expands too fast
Mitigation:
- keep MVP snapshot-only
- defer transaction engine and API sync

### Risk 2: Mixed currencies confuse totals
Mitigation:
- label currencies clearly
- avoid silent currency conversion
- add FX features later when requested

### Risk 3: Overly flashy UI slows progress
Mitigation:
- keep design simple and data-first

### Risk 4: Business logic becomes duplicated
Mitigation:
- centralize aggregation and comparison utilities

---

## 14. Future Expansion Ideas

These are not part of MVP but should remain possible later:

- CSV import/export
- FX conversion tables
- market data integration
- dividend tracking
- allocation targets and rebalancing view
- category customization
- dashboard presets
- authentication
- multi-user support

---

## 15. Release Definition for MVP
The MVP is ready when:

- snapshot CRUD works
- dashboard renders monthly summaries correctly
- list filters work correctly
- month-over-month comparison works correctly
- validation prevents bad input
- local development setup is smooth
- core logic has basic tests
