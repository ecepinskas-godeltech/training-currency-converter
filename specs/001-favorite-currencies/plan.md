# Implementation Plan: Favorite Currencies

**Branch**: `001-favorite-currencies` | **Date**: 2026-01-14 | **Spec**: [specs/001-favorite-currencies/spec.md](specs/001-favorite-currencies/spec.md)
**Input**: Feature specification from `/specs/001-favorite-currencies/spec.md`

## Summary

Add the ability for users to mark up to 5 currencies as favorites, which are persisted in localStorage and shown at the top of all currency selectors. The feature improves personalization and efficiency for frequent conversions.

## Technical Context

**Language/Version**: TypeScript (strict mode), Next.js 14
**Primary Dependencies**: React, Tailwind CSS, localStorage API, Jest, React Testing Library
**Storage**: localStorage (key: 'currency_favorites')
**Testing**: Jest, React Testing Library
**Target Platform**: Web (desktop/mobile)
**Project Type**: Single web app (Next.js)
**Performance Goals**: UI updates instantly on favorite change; no noticeable lag for up to 10 currencies
**Constraints**: Max 5 favorites; must persist across reloads; accessibility (WCAG 2.1 AA)
**Scale/Scope**: 10 supported currencies, 5 favorites per user

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Code quality: TypeScript, modular, JSDoc, review required
- Testing: ≥80% coverage, unit tests for all new code
- Accessibility: WCAG 2.1 AA, keyboard/screen reader support

## Project Structure

### Documentation (this feature)

- `/specs/001-favorite-currencies/spec.md` (feature spec)
- `/specs/001-favorite-currencies/plan.md` (this plan)
- `/specs/001-favorite-currencies/research.md` (to be created)
- `/specs/001-favorite-currencies/data-model.md` (to be created)
- `/contracts/001-favorite-currencies/` (API contracts if needed)

### Source

- `components/CurrencySelect.tsx` (update for favorites)
- `hooks/useConverter.ts` (manage favorites state)
- `utils/storage.ts` (persist favorites)
- `types/index.ts` (add FavoriteCurrency type)

### Tests

- `components/CurrencySelect.test.tsx`
- `hooks/useConverter.test.ts`
- `utils/storage.test.ts`

### Other

- Update documentation in `README.md` and `docs/` as needed
