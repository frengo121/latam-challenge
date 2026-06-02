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

Opens at `http://localhost:4200`. The app automatically reloads on file changes.

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

## Run Tests

```bash
ng test --watch=false
```

Runs the full unit test suite (17 tests) via Karma + Jasmine. Individual file:

```bash
ng test --include="**/user-api.service.spec.ts" --watch=false
```

---

## API Configuration

Edit `src/environments/environment.ts` to change the API base URL:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://dummyjson.com', // change this
};
```

In production, `src/environments/environment.prod.ts` is used instead (Angular CLI file replacement).

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

Since DummyJSON doesn't persist mutations (POST/PUT/DELETE respond successfully but don't save), `UsersStore` maintains an in-memory list that merges API responses with local mutations (active state, updated_at) to simulate persistence within the session.

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

// Derived state — computed automatically
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

## Screenshots

_Run `ng serve` and navigate to `http://localhost:4200` to see the app._

| View | Description |
|------|-------------|
| `/users` | Paginated table with search, role filter, status filter |
| `/users/new` | Create form with real-time validation |
| `/users/:id` | Detail card with edit/deactivate/delete actions |
| `/users/:id/edit` | Pre-populated edit form |
