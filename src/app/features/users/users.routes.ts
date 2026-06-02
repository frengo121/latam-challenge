import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/user-list/user-list.component').then(
        m => m.UserListComponent
      ),
    title: 'Users',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/user-form/user-form.component').then(
        m => m.UserFormComponent
      ),
    title: 'New User',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/user-detail/user-detail.component').then(
        m => m.UserDetailComponent
      ),
    title: 'User Detail',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/user-form/user-form.component').then(
        m => m.UserFormComponent
      ),
    title: 'Edit User',
  },
];
