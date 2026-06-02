import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { UserApiService } from './user-api.service';
import { User, DummyJsonUser } from '../models/user.model';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

const mockDummyUser: DummyJsonUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'admin',
};

describe('UserApiService', () => {
  let service: UserApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        UserApiService,
      ],
    });
    service = TestBed.inject(UserApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map DummyJSON firstName/lastName to first_name/last_name', () => {
    let result: User | undefined;
    service.getUserById(1).subscribe(u => (result = u));

    const req = httpMock.expectOne(r => r.url.includes('/users/1'));
    req.flush(mockDummyUser);

    expect(result!.first_name).toBe('Test');
    expect(result!.last_name).toBe('User');
  });

  it('should default active to true when not in API response', () => {
    let result: User | undefined;
    service.getUserById(1).subscribe(u => (result = u));

    const req = httpMock.expectOne(r => r.url.includes('/users/1'));
    req.flush({ ...mockDummyUser });

    expect(result!.active).toBe(true);
  });

  it('should normalize unknown roles to "user"', () => {
    let result: User | undefined;
    service.getUserById(1).subscribe(u => (result = u));

    const req = httpMock.expectOne(r => r.url.includes('/users/1'));
    req.flush({ ...mockDummyUser, role: 'moderator' });

    expect(result!.role).toBe('user');
  });

  it('should call /users/search with q param when search is provided', () => {
    service
      .getUsers({ search: 'john', role: '', active: null, page: 1, pageSize: 10 })
      .subscribe();

    const req = httpMock.expectOne(
      r => r.url.includes('/users/search') && r.params.get('q') === 'john'
    );
    req.flush({ users: [], total: 0, skip: 0, limit: 10 });

    expect(req.request.method).toBe('GET');
  });

  it('should call /users with skip/limit when no search term', () => {
    service
      .getUsers({ search: '', role: '', active: null, page: 2, pageSize: 5 })
      .subscribe();

    const req = httpMock.expectOne(
      r => r.url.includes('/users') && r.params.get('skip') === '5'
    );
    req.flush({ users: [], total: 0, skip: 5, limit: 5 });

    expect(req.request.params.get('limit')).toBe('5');
  });

  it('should send DELETE request to /users/:id', () => {
    service.deleteUser(1).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/users/1'));
    req.flush({ isDeleted: true, id: 1 });

    expect(req.request.method).toBe('DELETE');
  });
});
