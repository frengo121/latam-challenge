import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-container" role="status" aria-live="polite" [attr.aria-label]="message">
      <mat-spinner [diameter]="48" />
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      gap: 16px;
      color: rgba(0,0,0,.54);
    }
  `],
})
export class LoadingSkeletonComponent {
  @Input() message = 'Loading...';
}
