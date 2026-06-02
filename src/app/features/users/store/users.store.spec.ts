import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersStore } from './users.store';
import { UserApiService } from '../../../core/services/user-api.service';
import { User, UsersResponse } from '../../../core/models/user.model';

const mockUser: User = {
  id: 1,
  username: 'alice',
  email: 'alice@test.com',
  first_name: 'Alice',
  last_name: 'Smith',
  role: 'user',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  active: true,
};

const mockResponse: UsersResponse = {
  users: [mockUser],
  total: 1,
  skip: 0,
  limit: 10,
};

describe('UsersStore', () => {
  let store: UsersStore;
  let apiSpy: jasmine.SpyObj<UserApiService>;

  beforeEach(() => {
    apiSpy = jasmine.createSpyObj('UserApiService', [
      'getUsers',
      'createUser',
      'updateUser',
      'deleteUser',
      'getUserById',
    ]);
    apiSpy.getUsers.and.returnValue(of(mockResponse));

    TestBed.configureTestingModule({
      providers: [
        UsersStore,
        { provide: UserApiService, useValue: apiSpy },
      ],
    });

    store = TestBed.inject(UsersStore);
  });

  it('should initialize with empty state', () => {
    expect(store.users()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should load users and update signals on success', (done) => {
    apiSpy.getUsers.and.returnValue(of(mockResponse));
    store.loadUsers();
    expect(store.users()).toEqual([mockUser]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
    done();
  });

  it('should set error signal when API fails', (done) => {
    const err = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    apiSpy.getUsers.and.returnValue(throwError(() => err));

    store.loadUsers();

    expect(store.error()).not.toBeNull();
    expect(store.loading()).toBeFalse();
    done();
  });

  it('should prepend new user to list after createUser', (done) => {
    apiSpy.createUser.and.returnValue(
      of({ ...mockUser, id: 99, username: 'newuser' })
    );

    store.createUser({
      username: 'newuser',
      email: 'new@test.com',
      first_name: 'New',
      last_name: 'User',
      role: 'user',
      active: true,
    });

    expect(store.users().some(u => u.username === 'newuser')).toBeTrue();
    done();
  });
});
