import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  User,
  UserRole,
  DummyJsonUser,
  DummyJsonUsersResponse,
  UsersResponse,
  UserFilters,
  CreateUserPayload,
  UpdateUserPayload,
} from '../models/user.model';

const VALID_ROLES: UserRole[] = ['admin', 'user', 'guest'];

@Injectable({ providedIn: 'root' })
export class UserApiService {
  private http = inject(HttpClient);

  getUsers(filters: UserFilters): Observable<UsersResponse> {
    const skip = (filters.page - 1) * filters.pageSize;
    const params = new HttpParams()
      .set('limit', filters.pageSize)
      .set('skip', skip);

    const url = filters.search ? '/users/search' : '/users';
    const reqParams = filters.search ? params.set('q', filters.search) : params;

    return this.http
      .get<DummyJsonUsersResponse>(url, { params: reqParams })
      .pipe(map(res => this.mapUsersResponse(res)));
  }

  getUserById(id: number): Observable<User> {
    return this.http
      .get<DummyJsonUser>(`/users/${id}`)
      .pipe(map(u => this.mapUser(u)));
  }

  createUser(payload: CreateUserPayload): Observable<User> {
    return this.http
      .post<DummyJsonUser>('/users/add', this.toApiPayload(payload))
      .pipe(map(u => this.mapUser(u, payload)));
  }

  updateUser(id: number, payload: UpdateUserPayload): Observable<User> {
    return this.http
      .put<DummyJsonUser>(`/users/${id}`, this.toApiPayload(payload))
      .pipe(map(u => this.mapUser(u, payload)));
  }

  deleteUser(id: number): Observable<{ isDeleted: boolean; id: number }> {
    return this.http.delete<{ isDeleted: boolean; id: number }>(`/users/${id}`);
  }

  private mapUser(raw: DummyJsonUser, overrides: Partial<User> = {}): User {
    return {
      id: raw.id,
      username: raw.username,
      email: raw.email,
      first_name: raw.firstName,
      last_name: raw.lastName,
      role: VALID_ROLES.includes(raw.role as UserRole) ? (raw.role as UserRole) : 'user',
      created_at: overrides.created_at ?? new Date().toISOString(),
      updated_at: overrides.updated_at ?? new Date().toISOString(),
      active: overrides.active ?? true,
      ...overrides,
    };
  }

  private mapUsersResponse(raw: DummyJsonUsersResponse): UsersResponse {
    return {
      users: raw.users.map(u => this.mapUser(u)),
      total: raw.total,
      skip: raw.skip,
      limit: raw.limit,
    };
  }

  private toApiPayload(payload: Partial<User>): Record<string, unknown> {
    return {
      ...(payload.username && { username: payload.username }),
      ...(payload.email && { email: payload.email }),
      ...(payload.first_name && { firstName: payload.first_name }),
      ...(payload.last_name && { lastName: payload.last_name }),
      ...(payload.role && { role: payload.role }),
    };
  }
}
