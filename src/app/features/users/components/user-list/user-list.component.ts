import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UsersStore } from '../../store/users.store';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { UserRole } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    MatFormFieldModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  store = inject(UsersStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);

  displayedColumns = ['username', 'email', 'role', 'status', 'actions'];

  roleOptions: { value: UserRole | ''; label: string }[] = [
    { value: '', label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
    { value: 'guest', label: 'Guest' },
  ];

  searchControl = new FormControl('');

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(value => {
        this.store.setFilters({ search: value ?? '', page: 1 });
      });
  }

  ngOnInit(): void {
    this.store.loadUsers();
  }

  onPageChange(event: PageEvent): void {
    this.store.setPage(event.pageIndex + 1);
  }

  onRoleFilter(role: UserRole | ''): void {
    this.store.setFilters({ role, page: 1 });
  }

  onActiveFilter(active: boolean | null): void {
    this.store.setFilters({ active, page: 1 });
  }

  navigateTo(id: number): void {
    this.router.navigate(['/users', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/users', id, 'edit']);
  }

  confirmDelete(id: number, username: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Permanently delete "${username}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        danger: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deleteUser(id);
        this.toast.success(`User "${username}" deleted`);
      }
    });
  }

  confirmDeactivate(id: number, username: string): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate User',
        message: `Deactivate "${username}"? They will lose access until reactivated.`,
        confirmLabel: 'Deactivate',
        cancelLabel: 'Cancel',
        danger: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deactivateUser(id);
        this.toast.success(`User "${username}" deactivated`);
      }
    });
  }
}
