# Project: LATAM Frontend Challenge — Angular User Management SPA

## Stack
- Angular 17+ (standalone components, modern control flow `@if`/`@for`)
- Angular Material 17
- TypeScript strict mode
- Angular Signals (state management)
- Angular Reactive Forms
- DummyJSON REST API
- Karma + Jasmine (unit tests)

## Project Structure
```
src/app/
  core/          # Singleton services, interceptors, guards, models
  shared/        # Reusable presentational components, shared services
  features/
    users/       # User CRUD feature module
      store/     # Signal-based state (UsersStore)
      components/ # UserList, UserDetail, UserForm
```

## Key Rules
- Components NEVER call HttpClient directly — all HTTP goes through UserApiService
- Components NEVER mutate store state directly — use store methods
- All signals in UsersStore are private (writable); exposed as readonly via `.asReadonly()`
- Use `inject()` function over constructor injection (Angular 17+ style)
- Use `@if` / `@for` (not `*ngIf` / `*ngFor`) — Angular 17 modern control flow
- Interceptors are functions (`HttpInterceptorFn`), NOT classes
- All components are standalone — no NgModule

## Commit Convention
```
feat(scope): short description
fix(scope): short description
test(scope): short description
docs: short description
chore: short description
refactor(scope): short description
```

Scopes: `core`, `users`, `shared`, `shell`, `routing`

## Testing
- Run all tests: `ng test --watch=false`
- Run single file: `ng test --include="**/filename.spec.ts" --watch=false`
- Tests use Jasmine + Karma (no Jest)
- Services: use TestBed + jasmine.createSpyObj for dependencies
- HTTP: use provideHttpClientTesting + HttpTestingController

## Angular CLI
```bash
ng serve                              # dev server
ng build                              # dev build
ng build --configuration=production   # prod build
ng test --watch=false                 # run all tests once
ng lint                               # lint
```

## Important: DummyJSON Field Mapping
DummyJSON returns camelCase; our schema is snake_case:
- `firstName` → `first_name`
- `lastName` → `last_name`
- `active` → not in API, defaults to `true`
- `created_at` / `updated_at` → generated client-side
