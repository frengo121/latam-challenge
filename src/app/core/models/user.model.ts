export type UserRole = 'admin' | 'user' | 'guest';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
  active: boolean;
}

export interface DummyJsonUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface DummyJsonUsersResponse {
  users: DummyJsonUser[];
  total: number;
  skip: number;
  limit: number;
}

export interface UsersResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserFilters {
  search: string;
  role: UserRole | '';
  active: boolean | null;
  page: number;
  pageSize: number;
}

export type CreateUserPayload = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserPayload = Partial<CreateUserPayload>;
