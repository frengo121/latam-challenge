import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private isProduction = environment.production;

  log(...args: unknown[]): void {
    if (!this.isProduction) {
      console.log(...args);
    }
  }

  warn(...args: unknown[]): void {
    if (!this.isProduction) {
      console.warn(...args);
    }
  }

  error(...args: unknown[]): void {
    console.error(...args);
  }
}
