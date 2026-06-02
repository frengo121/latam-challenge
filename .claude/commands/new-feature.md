# New Angular Feature (TDD Workflow)

Use this when adding a new feature or service to the Angular app.

## Workflow

### Step 1 — Write the failing test first
Create `filename.spec.ts` with:
- `describe` block matching the class/function name
- At least one `it` block per public method
- Use `TestBed.configureTestingModule` for Angular services
- Use `jasmine.createSpyObj` for dependencies

### Step 2 — Verify the test fails
```bash
ng test --include="**/filename.spec.ts" --watch=false
```
Expected: FAILED (implementation doesn't exist yet)

### Step 3 — Implement the feature
Write the minimal implementation that makes the tests pass.
- Services: `@Injectable({ providedIn: 'root' })`
- Components: `standalone: true` with explicit `imports` array
- Use `inject()` over constructor injection
- Use modern control flow (`@if`, `@for`) in templates

### Step 4 — Verify tests pass
```bash
ng test --include="**/filename.spec.ts" --watch=false
```

### Step 5 — Verify full build
```bash
ng build
```

### Step 6 — Commit
Use /commit to stage and commit the changes.

## Angular 17 Patterns

### Service
```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  private dep = inject(OtherService);
}
```

### Standalone Component
```typescript
@Component({
  selector: 'app-my',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './my.component.html',
})
export class MyComponent {
  private service = inject(MyService);
}
```

### Signal Store Pattern
```typescript
private _state = signal<State>(initialState);
readonly state = this._state.asReadonly();
readonly derived = computed(() => this._state().value);
```
