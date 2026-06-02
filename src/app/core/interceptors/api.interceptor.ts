import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggerService } from '../services/logger.service';

export const apiInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const logger = inject(LoggerService);

  const url = req.url.startsWith('http') ? req.url : `${environment.apiUrl}${req.url}`;
  const apiReq = req.clone({ url });

  logger.log(`[HTTP] ${req.method} ${req.url}`);

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      logger.error(`[HTTP Error] ${error.status}: ${error.message}`, error);
      return throwError(() => error);
    })
  );
};
