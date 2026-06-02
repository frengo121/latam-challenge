# AI Usage

## Tools Used

- **Claude Code (claude-sonnet-4-6)** via Claude Code CLI — primary tool throughout the project.
  Used for: architecture planning, scaffolding components, implementing services, writing unit tests, debugging TypeScript errors, and reviewing code structure.

---

## Estimated AI Contribution

| Area | AI Contribution | Notes |
|------|----------------|-------|
| Architecture | 25% | AI suggested NgRx; I overrode to Signals. Folder structure was mine. |
| Components | 60% | AI generated initial templates; I refined logic and fixed Angular 17 syntax errors |
| Services | 55% | AI generated service shells; I corrected DummyJSON mapping and interceptor pattern |
| Tests | 65% | AI wrote test scaffolding; I corrected TestBed config and spy patterns |
| Documentation | 40% | README structure was mine; AI filled in code examples |

---

## Where AI Helped Most

### 1. Signal-based Store Design

**Before:** I had a rough idea of using signals but wasn't sure how to expose readonly state properly, or how to structure the `loadUsers` → `subscribe` → `signal.set` pattern.

**After:** AI produced the full `UsersStore` class with private writable signals and public `.asReadonly()` exposures, plus `computed()` for `totalPages`. I validated the pattern against Angular 17 docs and kept it.

Relevant file: `src/app/features/users/store/users.store.ts`

---

### 2. DummyJSON Field Mapping

**Before:** I knew DummyJSON used `firstName`/`lastName` (camelCase) and our schema required `first_name`/`last_name` (snake_case), but hadn't thought through how to handle missing fields (`active`, `created_at`, `updated_at`).

**After:** AI generated the full `mapUser()` private method in `UserApiService` that handles camelCase → snake_case mapping, defaults `active` to `true`, generates timestamps client-side, and normalizes unknown roles to `'user'`. I tested each mapping manually against the DummyJSON API response.

Relevant file: `src/app/core/services/user-api.service.ts`

---

### 3. RxJS Debounce in Search

**Before:** I wanted debounced search but couldn't remember the exact RxJS operator chain for a `FormControl` with `takeUntilDestroyed`.

**After:** AI produced the `valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())` pattern. I verified it prevented the memory leak by checking that unsubscription happened on component destroy.

Relevant file: `src/app/features/users/components/user-list/user-list.component.ts`

---

## Where AI Got It Wrong

### 1. Class-based Interceptor (Angular 8 style instead of Angular 17)

**What AI generated (wrong):**
```typescript
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiReq = req.clone({ url: `${environment.apiUrl}${req.url}` });
    return next.handle(apiReq);
  }
}
```

**Why it was wrong:** Angular 17 uses functional interceptors (`HttpInterceptorFn`), not class-based ones. The class-based approach also uses the deprecated `next.handle()` (now `next()`) and requires registering via `HTTP_INTERCEPTORS` token instead of `withInterceptors([])`.

**How I caught it:** The TypeScript compiler threw an error when I tried to register it with `withInterceptors([new ApiInterceptor()])` — the types didn't match. I also noticed `ng serve` warned about the deprecated pattern.

**The fix I applied:**
```typescript
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.startsWith('http') ? req.url : `${environment.apiUrl}${req.url}`;
  return next(req.clone({ url })).pipe(
    catchError((error: HttpErrorResponse) => throwError(() => error))
  );
};
```

---

### 2. Old `*ngFor` Syntax Instead of Angular 17 `@for`

**What AI generated (wrong):**
```html
<tr *ngFor="let user of users; trackBy: trackById">
  ...
</tr>
```

**Why it was wrong:** Angular 17 introduced the `@for` block syntax as a replacement for `*ngFor`. The challenge explicitly states that modern control flow syntax is encouraged. The old directive also required importing `CommonModule` or `NgForOf` in standalone components.

**How I caught it:** I reviewed the generated template and noticed it used the old directive syntax. Additionally, the component was missing `NgForOf` in its `imports` array, which would have caused a compile error.

**The fix I applied:**
```html
@for (user of store.users(); track user.id) {
  <tr>...</tr>
}
```

No extra import needed — `@for` is built into the Angular template engine.

---

### 3. NgRx Suggestion for State Management

**What AI initially suggested:** NgRx with actions, reducers, effects, and selectors — the full boilerplate.

**Why I rejected it:** NgRx makes sense for large teams or complex multi-domain state. This app has one entity (users) and one developer. NgRx would add ~150 lines of boilerplate (actions, reducer, effects, selectors, store module registration) for no architectural gain. A signal-based service store delivers the same reactivity with significantly less code.

**What I chose instead:** `UsersStore` — a plain `@Injectable({ providedIn: 'root' })` service with private `signal()` state, `computed()` for derived state, and public methods that call `UserApiService`. This is idiomatic Angular 17+ and can be migrated to NgRx Signals later if scale demands it.

---

## Decisions Made Without AI

### 1. Signal-based Store over NgRx

As described above, I chose a service-based signal store over NgRx because:
- Single domain (users only)
- One developer
- NgRx adds ~150 lines of boilerplate for one entity
- Angular Signals are the idiomatic Angular 17+ approach
- The store is easily testable without NgRx testing utilities

### 2. DummyJSON over Reqres

I chose DummyJSON because its data shape is the closest to the challenge schema. Reqres doesn't include `username` or `role` at all, which would require deriving both fields client-side — adding complexity with no benefit. DummyJSON has both, plus realistic pagination and search support.

### 3. No Separate Loading State per Operation

I chose a single `loading` signal for the entire store rather than per-operation loading signals (e.g., `loadingCreate`, `loadingDelete`). For an admin-facing internal tool with one user at a time, a shared loading signal is simpler and sufficient. Per-operation loading would be the right call for a concurrent multi-user dashboard.

---

## Prompting Strategy

I treated Claude Code as a senior pair programmer who needs context, not instructions. My prompts always included:
- **The specific Angular version** (17, standalone, signals) so it wouldn't generate legacy patterns
- **The exact TypeScript types** involved so it wouldn't make up field names
- **What I'd already decided** (e.g., "I'm using Signals, not NgRx") so it wouldn't suggest alternatives

When the output was wrong (interceptor style, ngFor syntax), I didn't just run the code — I read it before running it. The Angular 17 interceptor mistake was caught by reading the generated code against the Angular docs before even trying to compile.

I wrote the following by hand without AI assistance:
- The folder structure decision
- The decision to use `DummyJSON` over `Reqres`
- The `UserFilters` interface and its `active: boolean | null` design
- The `setInterval` fallback for pre-populating the edit form when `selectedUser` isn't ready yet (AI suggested `effect()` but it caused infinite loops in the TestBed environment)
