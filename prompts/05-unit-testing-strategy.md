# Prompt Session 05 — Unit Testing Strategy

**Goal:** Define which files to test, write the failing tests first (TDD), and get
the test suite to green.

---

## Prompt

```
Write unit tests for these Angular 17 services using Karma + Jasmine and TestBed:

1. LoggerService — test that console.log is suppressed in production, console.error always runs
2. UserApiService — test DummyJSON field mapping (firstName→first_name, missing active→true,
   unknown role→'user'), test that /users/search is called with q param when search is set
3. UsersStore — test initial state, loadUsers success path, error path, createUser optimistic update
4. ToastService — test that MatSnackBar.open is called with correct panelClass

Use provideHttpClient + provideHttpClientTesting for HTTP tests.
Use jasmine.createSpyObj for mocking dependencies.
Do NOT use HttpClientTestingModule (deprecated in Angular 17+).
```

---

## AI Response Summary

AI produced tests for all four services. The `UserApiService` tests were the most useful
as a starting point. The `UsersStore` tests needed the most revision.

---

## What I Accepted

- `provideHttpClient()` + `provideHttpClientTesting()` pattern (correct for Angular 17)
- `httpMock.expectOne(r => r.url.includes('/users/1'))` — using a predicate function
  instead of an exact URL string (avoids issues with interceptor URL transformations)
- `httpMock.verify()` in `afterEach` to catch unexpected requests
- `jasmine.createSpyObj('UserApiService', ['getUsers', ...])` for store tests
- `of(mockResponse)` as synchronous Observable return for spy methods

---

## What AI Got Wrong

### 1. Used deprecated `HttpClientTestingModule`

AI initially imported `HttpClientTestingModule` in the test module:
```typescript
// WRONG — deprecated in Angular 17
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule],
});
```

**Fix:**
```typescript
// CORRECT — Angular 17 standalone testing
TestBed.configureTestingModule({
  providers: [
    provideHttpClient(),
    provideHttpClientTesting(),
  ],
});
```

---

### 2. UsersStore tests called `store.users()` after async without `fakeAsync`

AI wrote:
```typescript
it('should load users', () => {
  store.loadUsers();
  expect(store.users().length).toBe(1); // fails — observable not yet resolved
});
```

This fails because even though `of(mockResponse)` is synchronous, `subscribe()` in
some testing contexts can be deferred. The fix was simpler than `fakeAsync` — since
`of()` is truly synchronous, just ensure the spy is configured before calling the method:

```typescript
it('should load users', (done) => {
  apiSpy.getUsers.and.returnValue(of(mockResponse));
  store.loadUsers();
  expect(store.users()).toEqual([mockUser]);
  done();
});
```

---

## What I Modified

- Added `afterEach(() => httpMock.verify())` — AI forgot this in the HTTP tests
- Changed `httpMock.expectOne('/users/1')` to `httpMock.expectOne(r => r.url.includes('/users/1'))` 
  because the interceptor transforms the URL before the mock sees it in some configs
- Removed `beforeAll` in favor of `beforeEach` for cleaner test isolation

---

## Final Test Count

- `LoggerService`: 4 tests
- `UserApiService`: 6 tests
- `UsersStore`: 4 tests
- `ToastService`: 3 tests
- **Total: 17 tests — all passing**
