<!--
Sync Impact Report
Version change: 1.0.0 → 1.1.0
Modified principles: All replaced (Code Quality, Testing Standards, Accessibility)
Added sections: None
Removed sections: None
Templates requiring updates:
- .specify/templates/plan-template.md ⚠ Constitution Check (update for new principles)
- .specify/templates/spec-template.md ⚠ Testing gates (update for new principles)
- .specify/templates/tasks-template.md ⚠ Task types (update for new principles)
Follow-up TODOs:
- TODO(RATIFICATION_DATE): Set original ratification date
-->

# Currency Converter Constitution

## Core Principles

### I. Code Quality

All code MUST follow strict TypeScript standards, be modular, readable, and maintainable. Use meaningful names, clear JSDoc comments, and adhere to project architecture patterns. Code reviews are mandatory before merging.

**Rationale:** High code quality ensures reliability, maintainability, and ease of onboarding for contributors.

### II. Testing Standards

All features and bug fixes MUST include unit tests. Minimum 80% code coverage is required for new code. Use Jest and React Testing Library. Mock external dependencies and verify behavior, not implementation details.

**Rationale:** Rigorous testing prevents regressions, ensures feature reliability, and supports safe refactoring.

### III. Accessibility

All user-facing components MUST meet WCAG 2.1 AA accessibility standards. Use semantic HTML, proper ARIA attributes, and ensure keyboard navigation and screen reader compatibility.

**Rationale:** Accessibility guarantees usability for all users and compliance with legal and ethical standards.

## Additional Constraints

N/A

## Development Workflow

N/A

## Governance

This constitution supersedes all other practices. Amendments require documentation, approval, and a migration plan. All PRs/reviews MUST verify compliance with principles. Use README.md and docs for runtime development guidance.

**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-01-14
