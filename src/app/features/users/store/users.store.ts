import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UserApiService } from '../../../core/services/user-api.service';
import { LoggerService } from '../../../core/services/logger.service';
import {
  User,
  UserFilters,
  UsersResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from '../../../core/models/user.model';

const DEFAULT_FILTERS: UserFilters = {
  search: '',
  role: '',
  active: null,
  page: 1,
  pageSize: 10,
};

@Injectable({ providedIn: 'root' })
export class UsersStore {
  private api = inject(UserApiService);
  private logger = inject(LoggerService);

  private _users = signal<User[]>([]);
  private _selectedUser = signal<User | null>(null);
  private _loading = signal(false);
  private _error = signal<string | null>(null);
  private _total = signal(0);
  private _filters = signal<UserFilters>({ ...DEFAULT_FILTERS });

  readonly users = this._users.asReadonly();
  readonly selectedUser = this._selectedUser.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = this._total.asReadonly();
  readonly filters = this._filters.asReadonly();

  readonly totalPages = computed(() =>
    Math.ceil(this._total() / this._filters().pageSize)
  );

  loadUsers(): void {
    this._loading.set(true);
    this._error.set(null);

    const filters = this._filters();
    // DummyJSON doesn't support role/active filtering — fetch all and filter client-side
    const hasClientFilter = filters.role !== '' || filters.active !== null;
    const apiFilters = hasClientFilter ? { ...filters, page: 1, pageSize: 100 } : filters;

    this.api.getUsers(apiFilters).subscribe({
      next: (res: UsersResponse) => {
        let users = res.users.map(apiUser => {
          const local = this._users().find(u => u.id === apiUser.id);
          return local
            ? { ...apiUser, active: local.active, updated_at: local.updated_at }
            : apiUser;
        });

        if (filters.role) users = users.filter(u => u.role === filters.role);
        if (filters.active !== null) users = users.filter(u => u.active === filters.active);

        if (hasClientFilter) {
          const start = (filters.page - 1) * filters.pageSize;
          this._users.set(users.slice(start, start + filters.pageSize));
          this._total.set(users.length);
        } else {
          this._users.set(users);
          this._total.set(res.total);
        }

        this._loading.set(false);
        this.logger.log('[UsersStore] Loaded', users.length, 'users');
      },
      error: (err: HttpErrorResponse) => {
        this._error.set(err.message ?? 'Failed to load users');
        this._loading.set(false);
        this.logger.error('[UsersStore] Load failed', err);
      },
    });
  }

  loadUserById(id: number): void {
    // Use local store first — avoids API call for locally-created users
    const local = this._users().find(u => u.id === id);
    if (local) {
      this._selectedUser.set(local);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    this.api.getUserById(id).subscribe({
      next: (user) => {
        this._selectedUser.set(user);
        this._loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this._error.set(err.message ?? 'Failed to load user');
        this._loading.set(false);
      },
    });
  }

  createUser(payload: CreateUserPayload): void {
    this._loading.set(true);

    this.api.createUser(payload).subscribe({
      next: (created) => {
        const newUser: User = {
          ...created,
          ...payload,
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this._users.update(users => [newUser, ...users]);
        this._total.update(t => t + 1);
        this._loading.set(false);
        this.logger.log('[UsersStore] Created user', newUser.username);
      },
      error: (err: HttpErrorResponse) => {
        this._error.set(err.message ?? 'Failed to create user');
        this._loading.set(false);
      },
    });
  }

  updateUser(id: number, payload: UpdateUserPayload): void {
    this._loading.set(true);

    // Apply in-memory update immediately so the UI reflects changes regardless of API outcome
    const updated = { ...payload, updated_at: new Date().toISOString() };
    this._users.update(users =>
      users.map(u => (u.id === id ? { ...u, ...updated } : u))
    );
    if (this._selectedUser()?.id === id) {
      this._selectedUser.update(u => (u ? { ...u, ...updated } : null));
    }

    this.api.updateUser(id, payload).subscribe({
      next: () => {
        this._loading.set(false);
        this.logger.log('[UsersStore] Updated user', id);
      },
      error: (err: HttpErrorResponse) => {
        // API errors are expected for locally-created users (no DummyJSON entry)
        // In-memory update was already applied above
        this._loading.set(false);
        this.logger.warn('[UsersStore] API update skipped for local user', err.status);
      },
    });
  }

  deleteUser(id: number): void {
    this._loading.set(true);

    this.api.deleteUser(id).subscribe({
      next: () => {
        this._users.update(users => users.filter(u => u.id !== id));
        this._total.update(t => t - 1);
        this._loading.set(false);
        this.logger.log('[UsersStore] Deleted user', id);
      },
      error: (err: HttpErrorResponse) => {
        this._error.set(err.message ?? 'Failed to delete user');
        this._loading.set(false);
      },
    });
  }

  deactivateUser(id: number): void {
    this._users.update(users =>
      users.map(u =>
        u.id === id ? { ...u, active: false, updated_at: new Date().toISOString() } : u
      )
    );
    this.logger.log('[UsersStore] Deactivated user', id);
  }

  setFilters(partial: Partial<UserFilters>): void {
    this._filters.update(f => ({ ...f, ...partial, page: partial.page ?? 1 }));
    this.loadUsers();
  }

  setPage(page: number): void {
    this._filters.update(f => ({ ...f, page }));
    this.loadUsers();
  }

  clearError(): void {
    this._error.set(null);
  }

  clearSelectedUser(): void {
    this._selectedUser.set(null);
  }
}
