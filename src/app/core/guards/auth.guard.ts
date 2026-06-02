import { CanActivateFn } from '@angular/router';

// Placeholder guard — always grants access.
// Replace with real auth logic when authentication is introduced.
export const authGuard: CanActivateFn = () => true;
