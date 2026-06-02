import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { UsersStore } from '../../store/users.store';
import { ToastService } from '../../../../shared/services/toast.service';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    LoadingSkeletonComponent,
    EmptyStateComponent,
  ],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnInit {
  @Input() id!: string;

  store = inject(UsersStore);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);

  ngOnInit(): void {
    this.store.loadUserById(+this.id);
  }

  edit(): void {
    this.router.navigate(['/users', this.id, 'edit']);
  }

  back(): void {
    this.router.navigate(['/users']);
  }

  confirmDelete(): void {
    const user = this.store.selectedUser();
    if (!user) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Permanently delete "${user.username}"?`,
        confirmLabel: 'Delete',
        danger: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deleteUser(user.id);
        this.toast.success('User deleted');
        this.router.navigate(['/users']);
      }
    });
  }

  confirmDeactivate(): void {
    const user = this.store.selectedUser();
    if (!user) return;

    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Deactivate User',
        message: `Deactivate "${user.username}"?`,
        confirmLabel: 'Deactivate',
        danger: true,
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.deactivateUser(user.id);
        this.toast.success(`"${user.username}" deactivated`);
      }
    });
  }
}
