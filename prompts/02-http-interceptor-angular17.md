# Prompt Session 02 — HTTP Interceptor (Angular 17 Functional Style)

**Goal:** Create an HttpInterceptor that prepends the base API URL to every request
and handles errors centrally.

---

## Prompt

```
Create an Angular HttpInterceptor for this project:
- Prepend environment.apiUrl to every request URL
- Skip if URL already starts with http (external requests)
- Log every request with LoggerService
- Catch HTTP errors, log them, and rethrow
- Register it in app.config.ts

Angular 17, standalone, TypeScript strict mode.
```

---

## AI First Response (Wrong)

```typescript
// WRONG - Angular 8/9 class-based style
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const url = `${environment.apiUrl}${req.url}`;
    const apiReq = req.clone({ url });
    this.logger.log(`[HTTP] ${req.method} ${req.url}`);
    return next.handle(apiReq).pipe(
      catchError(err => {
        this.logger.error('[HTTP Error]', err);
        return throwError(err);
      })
    );
  }
}
```

**Registration it suggested:**
```typescript
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true }
]
```

---

## Problems Identified

1. **Class-based interceptor** — Angular 17 introduced `HttpInterceptorFn` (functional interceptors). The class-based approach still works but is deprecated in the new standalone/functional paradigm.

2. **`next.handle()`** — Deprecated in Angular 17+. The new API uses `next(req)` directly.

3. **`throwError(err)`** — Deprecated. Angular requires `throwError(() => err)` (factory form) to avoid eager error creation.

4. **Constructor injection** — Angular 17+ prefers `inject()` inside the function body.

5. **Registration** — `HTTP_INTERCEPTORS` token approach doesn't work with `provideHttpClient(withInterceptors([]))` used in standalone apps.

---

## How I Caught It

- Tried to register it in `app.config.ts` with `withInterceptors([new ApiInterceptor()])` — TypeScript error immediately: type `ApiInterceptor` is not assignable to `HttpInterceptorFn`.
- Cross-referenced with Angular 17 official docs on [HttpClient standalone](https://angular.io/guide/http-interceptors).

---

## Fixed Version I Applied

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../services/logger.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  const url = req.url.startsWith('http')
    ? req.url
    : `${environment.apiUrl}${req.url}`;

  const apiReq = req.clone({ url });
  logger.log(`[HTTP] ${req.method} ${req.url}`);

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error(`[HTTP Error] ${error.status}: ${error.message}`);
      return throwError(() => error);
    })
  );
};
```

**Registration in app.config.ts:**
```typescript
provideHttpClient(withInterceptors([apiInterceptor]))
```

---

## What I Accepted

- The general logic: URL prepending, skip check for external URLs, error logging + rethrow

## What I Discarded

- The class-based implementation entirely
- Constructor injection inside the interceptor
- `next.handle()` and deprecated `throwError(err)` (non-factory form)

## What I Modified

- Rewrote as `HttpInterceptorFn` function
- Used `inject(LoggerService)` inside the function body
- Fixed `throwError(() => error)` with factory form
- Updated registration to use `withInterceptors([])`
