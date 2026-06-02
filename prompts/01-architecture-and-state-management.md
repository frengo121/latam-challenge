# Prompt Session 01 — Architecture and State Management Decision

**Goal:** Decide on folder structure, state management approach, and UI library before writing any code.

---

## Prompt

```
I'm building an Angular 17 SPA for a user management challenge. Requirements:
- CRUD on users (list, detail, create, edit, delete, deactivate)
- DummyJSON as the API
- TypeScript strict mode
- Standalone components
- Angular 17 modern control flow (@if, @for)
- Unit tests for at least 3 services

The user schema is: id, username, email, first_name, last_name, role (admin|user|guest),
created_at, updated_at, active.

DummyJSON returns firstName/lastName (camelCase) and doesn't have active, created_at,
or updated_at.

What state management approach would you recommend and why? Also suggest a folder structure.
```

---

## AI Response Summary

AI suggested **NgRx** as the primary recommendation, with a feature-based folder structure
using `core/`, `shared/`, and `features/users/`. The NgRx suggestion included the full
boilerplate: actions, reducer, effects, selectors, and store module.

It also mentioned Angular Signals as an alternative, noting it was "less mature for
production use" (which was incorrect — Signals are stable in Angular 17+).

---

## What I Accepted

- The feature-based folder structure: `core/`, `shared/`, `features/users/`
- The layering concept: Core for singletons, Shared for reusable UI, Features for domain
- The `UsersStore` naming convention

---

## What I Discarded

- **NgRx**: Too much boilerplate for a single-domain, single-developer app. NgRx makes
  sense at scale; here it adds ~150 lines of boilerplate for one entity.
- The claim that Signals are "less mature" — this was a hallucination. Signals are stable
  in Angular 17+ and explicitly listed as an option in the challenge requirements.

---

## What I Modified

- Chose Angular Signals service store instead of NgRx
- Designed the store as a plain `@Injectable({ providedIn: 'root' })` class with private
  writable signals and public `.asReadonly()` exposures
- Added `computed()` for `totalPages` — AI didn't suggest this initially
- Added `UserFilters` interface to encapsulate filter state — AI had these as separate params
