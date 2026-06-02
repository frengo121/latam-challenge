import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { UsersStore } from '../../store/users.store';
import { ToastService } from '../../../../shared/services/toast.service';
import { LoadingSkeletonComponent } from '../../../../shared/components/loading-skeleton/loading-skeleton.component';
import { UserRole } from '../../../../core/models/user.model';

function noSpacesValidator(control: AbstractControl): { noSpaces: true } | null {
  return /\s/.test(control.value ?? '') ? { noSpaces: true } : null;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    TitleCasePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    LoadingSkeletonComponent,
  ],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  @Input() id?: string;

  store = inject(UsersStore);
  private router = inject(Router);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);

  get isEditMode(): boolean { return !!this.id; }

  roles: UserRole[] = ['admin', 'user', 'guest'];

  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), noSpacesValidator]],
    email: ['', [Validators.required, Validators.email]],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    role: ['user' as UserRole, Validators.required],
    active: [true],
  });

  ngOnInit(): void {
    if (this.isEditMode) {
      this.store.loadUserById(+this.id!);
      const waitForUser = setInterval(() => {
        const user = this.store.selectedUser();
        if (user && user.id === +this.id!) {
          this.form.patchValue({
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            active: user.active,
          });
          clearInterval(waitForUser);
        }
      }, 50);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    if (this.isEditMode) {
      this.store.updateUser(+this.id!, {
        username: value.username!,
        email: value.email!,
        first_name: value.first_name!,
        last_name: value.last_name!,
        role: value.role as UserRole,
        active: value.active ?? true,
      });
      this.toast.success('User updated successfully');
    } else {
      this.store.createUser({
        username: value.username!,
        email: value.email!,
        first_name: value.first_name!,
        last_name: value.last_name!,
        role: value.role as UserRole,
        active: value.active ?? true,
      });
      this.toast.success('User created successfully');
    }

    this.router.navigate(['/users']);
  }

  cancel(): void {
    this.router.navigate(this.isEditMode ? ['/users', this.id] : ['/users']);
  }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.touched && ctrl?.hasError(error));
  }
}
