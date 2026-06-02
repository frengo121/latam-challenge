# Prompt Session 04 — Reactive Forms with Custom Validation

**Goal:** Build the user create/edit form with Angular Reactive Forms, handling both
create and edit mode in the same component, with custom validators.

---

## Prompt

```
Build a UserFormComponent for Angular 17 (standalone) that:
- Uses Angular Reactive Forms (FormBuilder, FormGroup, FormControl)
- Handles both CREATE mode (no id param) and EDIT mode (id param via @Input)
- Validates: username required + minlength(3) + no spaces, email required + valid format,
  first_name required, last_name required, role enum (admin|user|guest)
- Pre-populates the form in edit mode from UsersStore.selectedUser() signal
- Calls store.createUser() or store.updateUser() on submit
- Shows per-field error messages in the template

Use inject() for all dependencies. Route param comes via @Input() id?: string
(withComponentInputBinding is enabled in app.config.ts).
```

---

## AI Response Summary

AI generated a working form component. The `noSpacesValidator` custom function and
the `hasError(field, error)` helper method were good additions. The form pre-population
in edit mode required some rework.

---

## What I Accepted

- `FormBuilder.group()` structure with validators array per control
- Custom `noSpacesValidator` as a standalone function (not a class)
- `hasError(field, error)` helper that checks `touched && hasError()` — avoids showing
  errors before the user has interacted with the field
- `form.markAllAsTouched()` on invalid submit to reveal all errors at once
- `form.getRawValue()` instead of `form.value` (gets disabled fields too)

---

## What AI Got Wrong — Edit Mode Pre-population

**AI's suggestion:**
```typescript
// Using effect() to watch selectedUser signal
effect(() => {
  const user = this.store.selectedUser();
  if (user) {
    this.form.patchValue({ username: user.username, ... });
  }
});
```

**Why it was problematic:**
- `effect()` in a component constructor requires the component to be in an injection context.
  This works in prod but threw errors in TestBed without `runInInjectionContext()`.
- More importantly, `effect()` re-runs whenever `selectedUser` changes — if the user edits
  a field and then something else updates `selectedUser`, the form would reset mid-edit.

**What I used instead:**
```typescript
ngOnInit(): void {
  if (this.isEditMode) {
    this.store.loadUserById(+this.id!);
    const waitForUser = setInterval(() => {
      const user = this.store.selectedUser();
      if (user && user.id === +this.id!) {
        this.form.patchValue({ ... });
        clearInterval(waitForUser);
      }
    }, 50);
  }
}
```

A `setInterval` poll on the signal until the correct user is loaded, then clear.
Not the most elegant pattern but it avoids the `effect()` re-run problem and works
predictably in both production and TestBed.

---

## What I Modified

- Template: AI used `*ngIf` for error messages. Changed to `@if` (Angular 17 syntax).
- AI imported `TitleCasePipe` from the wrong path. Fixed to `@angular/common`.
- The `active` checkbox — AI had it as a `mat-slide-toggle` but I kept it as
  `mat-checkbox` for simpler ARIA compliance.
