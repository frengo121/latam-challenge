# Prompt Session 03 — Signal-based UsersStore Design

**Goal:** Design a reactive state store using Angular Signals that manages user list,
selected user, loading/error states, filters, and pagination — without NgRx.

---

## Prompt

```
Design a UsersStore service for Angular 17 using Signals (not NgRx).

Requirements:
- State: users[], selectedUser, loading, error, total, filters (search, role, active, page, pageSize)
- Expose state as readonly signals — components should not be able to write directly
- computed() for totalPages
- Methods: loadUsers(), loadUserById(id), createUser(payload), updateUser(id, payload),
  deleteUser(id), deactivateUser(id), setFilters(partial), setPage(page)
- DummyJSON doesn't persist mutations, so keep an in-memory list that survives API reloads
- Inject UserApiService and LoggerService via inject()

TypeScript strict mode. Angular 17 standalone.
```

---

## AI Response Summary

AI produced a working `UsersStore` with the correct pattern. The key design decisions
it got right:
- Private `signal<T>()` for writable state
- Public `.asReadonly()` exposures
- `computed(() => Math.ceil(total() / pageSize()))` for totalPages
- In-memory merge in `loadUsers()` to preserve `active` and `updated_at` across API reloads

---

## What I Accepted

- The overall signal encapsulation pattern (private writable, public readonly)
- The `loadUsers()` implementation with in-memory merge
- The `computed()` pattern for totalPages
- Using `update()` (not `set()`) for array mutations like `filter` and `map`

---

## What I Discarded

- AI included `effect(() => this.loadUsers())` that triggered on filter changes. This caused
  infinite loops in tests (effect → loadUsers → signal.set → triggers effect again).
  Removed it and replaced with explicit `this.loadUsers()` calls at the end of `setFilters()`
  and `setPage()`.

---

## What I Modified

- `deactivateUser()`: AI made it call the API and wait for response. Since DummyJSON doesn't
  persist this and `active` is client-side only, I changed it to a pure in-memory update
  (no API call, just `_users.update(...)`) — simpler and avoids a pointless HTTP round-trip.

- `createUser()`: AI used the API-returned `id` (which DummyJSON always returns as 208).
  I overrode to use `Date.now()` as a local ID to ensure uniqueness in the in-memory session.

---

## Test Challenges

When writing the `UsersStore` spec:
- `effect()` required `TestBed.flushEffects()` to trigger synchronously — removing it
  simplified tests significantly
- `of(mockResponse)` (synchronous Observable) was enough for most tests — no need for
  async patterns
- `jasmine.createSpyObj` for `UserApiService` worked well; dependency mocking via
  `TestBed.configureTestingModule providers`
