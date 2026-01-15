---
description: "Task list for Favorite Currencies feature implementation"
---

# Tasks: Favorite Currencies

**Input**: Design documents from `/specs/001-favorite-currencies/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create feature branch `001-favorite-currencies`
- [ ] T002 [P] Add FavoriteCurrency type to types/index.ts
- [ ] T003 [P] Add localStorage key for favorites to utils/storage.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T004 [P] Add favorites state management to hooks/useConverter.ts
- [ ] T005 [P] Add favorites prop to CurrencySelect.tsx

---

## Phase 3: User Story 1 - Mark Currency as Favorite (Priority: P1)

**Goal**: Users can mark/unmark currencies as favorites
**Independent Test Criteria**: Mark a currency as favorite, verify it appears in favorites and persists after reload

- [ ] T006 [US1] Implement favorite toggle UI in CurrencySelect.tsx
- [ ] T007 [US1] Persist favorites in localStorage via utils/storage.ts
- [ ] T008 [US1] Restore favorites on page load in hooks/useConverter.ts
- [ ] T009 [P] [US1] Unit test favorite toggle in CurrencySelect.test.tsx
- [ ] T010 [P] [US1] Unit test persistence in storage.test.ts
- [ ] T011 [P] [US1] Unit test restore logic in useConverter.test.ts

---

## Phase 4: User Story 2 - Favorites at Top of Selector (Priority: P2)

**Goal**: Favorites appear at top of selectors
**Independent Test Criteria**: Mark favorites, verify order in selector

- [ ] T012 [US2] Update CurrencySelect.tsx to render favorites first
- [ ] T013 [P] [US2] Unit test selector order in CurrencySelect.test.tsx

---

## Phase 5: User Story 3 - Limit Favorites to 5 (Priority: P3)

**Goal**: Limit favorites to 5, block excess
**Independent Test Criteria**: Mark 5 favorites, attempt 6th, verify message and block

- [ ] T014 [US3] Enforce max 5 favorites in useConverter.ts
- [ ] T015 [US3] Show clear message when limit exceeded in CurrencySelect.tsx
- [ ] T016 [P] [US3] Unit test limit logic in useConverter.test.ts
- [ ] T017 [P] [US3] Unit test message display in CurrencySelect.test.tsx

---

## Final Phase: Polish & Cross-Cutting Concerns

- [ ] T018 [P] Update README.md and docs to document favorites feature
- [ ] T019 [P] Accessibility review: keyboard and screen reader support for all favorite actions
- [ ] T020 [P] Achieve ≥80% test coverage for all new code

## Dependencies

- US1 → US2, US3 (must be able to mark favorites before ordering/limiting)

## Parallel Execution Examples

- T009, T010, T011 can run in parallel after T008
- T013, T016, T017, T018, T019, T020 can run in parallel after their respective story implementations

## Implementation Strategy

- MVP: Complete Phase 3 (User Story 1)
- Incremental: Add ordering (Phase 4), then limit (Phase 5), then polish
