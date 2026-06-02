# User Management SPA

Angular 17 SPA for managing users, built for the LATAM Frontend Engineer Challenge.

Consumes the [DummyJSON](https://dummyjson.com/users) API to perform full CRUD operations on users with state management via Angular Signals, Angular Material UI, and WCAG 2.1 AA compliance.

---

## Stack

| Technology | Version | Role |
|-----------|---------|------|
| Angular | 17.3 | Framework (standalone components, modern control flow) |
| Angular Material | 17.3 | UI component library |
| TypeScript | 5.4 | Language (strict mode) |
| Angular Signals | built-in | State management |
| Angular Reactive Forms | built-in | Form validation |
| Karma + Jasmine | built-in | Unit testing |
| Playwright | 1.x | End-to-end testing |
| Prettier | 3.x | Code formatting |
| Husky + lint-staged | 9.x / 15.x | Pre-commit hooks |

---

## Install

Requires **Node 18+** and **Angular CLI 17+**.

```bash
npm install -g @angular/cli@17
npm install
```

---

## Run Locally

```bash
ng serve
```

Opens at `http://localhost:4200`. The app reloads automatically on file changes.

---

## Build for Production

```bash
ng build --configuration=production
```

Output goes to `dist/latam-challenge/`. Production build includes:
- **AOT** compilation
- **Tree-shaking**
- **Lazy-loaded routes** (users feature bundle loaded on demand)
- **Output hashing** for cache busting

---

## Run Unit Tests

```bash
ng test --watch=false
```

Runs the full unit test suite (**21 tests**) via Karma + Jasmine. Run a single file:

```bash
ng test --include="**/user-api.service.spec.ts" --watch=false
```

Test files covered:

| File | Tests |
|------|-------|
| `logger.service.spec.ts` | 4 |
| `user-api.service.spec.ts` | 6 |
| `users.store.spec.ts` | 4 |
| `toast.service.spec.ts` | 3 |
| `app.component.spec.ts` | 3 |
| **Total** | **21** |

---

## Run E2E Tests (Playwright)

> The dev server must be running at `http://localhost:4200` before running E2E tests.

```bash
# First-time setup — install Playwright browser binaries
npx playwright install chromium

# Start the dev server (in a separate terminal)
ng serve

# Run the E2E suite
npm run e2e

# Open the HTML report after a run
npm run e2e:report
```

E2E flows covered:

| Test | Flow |
|------|------|
| Load users list | Table, paginator, and rows are visible |
| Search | Debounced search returns matching results |
| Filter by role | Dropdown filters client-side; all results match role |
| Full user flow | Create → view detail → edit → deactivate |
| Cancel delete dialog | Dialog opens and closes without deleting |

---

## API Configuration

Edit `src/environments/environment.ts` to change the API base URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://dummyjson.com', // change this to point to another API
};
```

In production, `src/environments/environment.prod.ts` is used (Angular CLI file replacement).

---

## Why DummyJSON

Chosen over Reqres and JSONPlaceholder because its user schema is the closest to the challenge requirements:

| Feature | DummyJSON | Reqres | JSONPlaceholder |
|---------|-----------|--------|----------------|
| `username` | ✅ | ❌ | ❌ |
| `email` | ✅ | ✅ | ✅ |
| `role` | ✅ | ❌ | ❌ |
| Pagination | ✅ | ✅ | ❌ |
| Search | ✅ | ❌ | ❌ |
| Simulated CRUD | ✅ | ✅ | ✅ |

---

## API Endpoints

| Operation | Endpoint | Notes |
|-----------|----------|-------|
| List users | `GET /users?limit=10&skip=0` | Paginated |
| Search | `GET /users/search?q=term` | Full-text search |
| Get by ID | `GET /users/:id` | Single user |
| Create | `POST /users/add` | Returns simulated new user |
| Update | `PUT /users/:id` | Simulated — not persisted server-side |
| Delete | `DELETE /users/:id` | Returns `{ isDeleted: true }` |

All requests go through `UserApiService`. Components never call `HttpClient` directly.

---

## Field Mapping

DummyJSON returns camelCase and is missing some fields. All mapping happens in `UserApiService.mapUser()`:

| Challenge field | DummyJSON field | Handling |
|----------------|-----------------|----------|
| `first_name` | `firstName` | Mapped in `mapUser()` |
| `last_name` | `lastName` | Mapped in `mapUser()` |
| `active` | _(missing)_ | Defaults to `true`; in-memory only |
| `created_at` | _(missing)_ | `new Date().toISOString()` on create |
| `updated_at` | _(missing)_ | `new Date().toISOString()` on update |
| `role` | `role` | Unknown roles normalized to `'user'` |

Since DummyJSON doesn't persist mutations, `UsersStore` maintains an in-memory list that merges API responses with local mutations (active state, updated_at) to simulate persistence within the session.

> **Note:** Deactivating a user or creating one persists only for the current browser session. A full page refresh will restore the original DummyJSON state — this is an expected limitation of using a mock API.

---

## State Management

Uses a **signal-based service store** (`UsersStore`) instead of NgRx.

**Why not NgRx?**
- Single domain (users), single developer
- NgRx would add ~150 lines of boilerplate (actions, reducer, effects, selectors) for one entity
- Angular Signals are idiomatic Angular 17+ and explicitly listed as an option in the challenge
- The store is trivially testable with `jasmine.createSpyObj` — no NgRx testing utilities needed

**Pattern:**
```typescript
// Private writable — only the store can mutate
private _users = signal<User[]>([]);

// Public readonly — components only read
readonly users = this._users.asReadonly();

// Derived state — recomputed automatically
readonly totalPages = computed(() => Math.ceil(this._total() / this._filters().pageSize));
```

---

## Architecture

```
src/app/
├── core/
│   ├── interceptors/   # HttpInterceptorFn for base URL + error handling
│   ├── models/         # TypeScript interfaces (User, UserFilters, etc.)
│   ├── services/       # UserApiService, LoggerService
│   └── guards/         # authGuard (placeholder)
├── shared/
│   ├── components/     # LoadingSkeleton, EmptyState, ConfirmDialog
│   └── services/       # ToastService
└── features/
    └── users/
        ├── store/      # UsersStore (signal-based state)
        ├── components/ # UserList, UserDetail, UserForm
        └── users.routes.ts
```

**Key rules:**
- Components only call store methods — never `UserApiService` directly
- `UsersStore` only calls `UserApiService` — never `HttpClient` directly
- All HTTP goes through the `apiInterceptor` (base URL + error logging)

---

## Main Flows

| Flow | Route |
|------|-------|
| List users (paginated, searchable, filterable) | `/users` |
| View user detail | `/users/:id` |
| Create user | `/users/new` |
| Edit user | `/users/:id/edit` |
| Deactivate user | From list or detail → confirmation dialog |
| Delete user | From list or detail → confirmation dialog |

---

## Validation

All validation is in `UserFormComponent` using Angular Reactive Forms:

| Field | Rules |
|-------|-------|
| `username` | Required, min 3 chars, no spaces (custom validator) |
| `email` | Required, valid email format |
| `first_name` | Required |
| `last_name` | Required |
| `role` | Required, enum: `admin \| user \| guest` |

Errors show per-field on touch. `form.markAllAsTouched()` reveals all errors on invalid submit.

---

## Accessibility (WCAG 2.1 AA)

- All interactive elements have `aria-label`
- Table uses `scope="col"` on headers
- Error messages use `role="alert"` or `aria-live`
- Loading state uses `role="status"` + `aria-live="polite"`
- Keyboard navigation: `tabindex="0"` + `keydown.enter` on table rows
- Angular Material provides focus states and contrast out of the box

---

## Bonus Features

All optional extras from the challenge spec were implemented:

### Dark Mode
Toggle in the top toolbar (moon/sun icon). Preference is persisted in `localStorage` and restored on page load. Dark theme overrides all Angular Material components via a `.dark-theme` class on `<body>`.

### Skeleton Loaders
The `LoadingSkeletonComponent` renders shimmer-animated placeholder boxes instead of a spinner:
- **`type="table"`** — mimics the user table rows (used in `UserListComponent`)
- **`type="card"`** — mimics a detail/form card (used in `UserDetailComponent` and `UserFormComponent`)
- Adapts colors automatically in dark mode via `:host-context(.dark-theme)`

### Husky + Prettier + lint-staged
Pre-commit hook runs Prettier on all staged `*.ts`, `*.html`, `*.scss`, and `*.json` files before every commit. Configuration in `.prettierrc` and `package.json` (`lint-staged` key).

### Server-Side Pagination + Debounced Search
Search is debounced at 300ms (`debounceTime` + `distinctUntilChanged`) and hits the DummyJSON `/users/search` endpoint. Pagination uses DummyJSON's `skip`/`limit` parameters. Role and active filters are applied client-side (DummyJSON does not support them natively).

### E2E Tests (Playwright)
Five tests covering the full user management flow. See [Run E2E Tests](#run-e2e-tests-playwright) section above.

---

## Screenshots

_Run `ng serve` and navigate to `http://localhost:4200` to see the app._

| View | Description |
|------|-------------|
| `/users` | Paginated table with search, role filter, status filter |
| `/users/new` | Create form with real-time validation |
| `/users/:id` | Detail card with edit/deactivate/delete actions |
| `/users/:id/edit` | Pre-populated edit form |
