import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state" role="status">
      <mat-icon class="empty-icon" aria-hidden="true">{{ icon }}</mat-icon>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px;
      text-align: center;
      color: rgba(0,0,0,.54);
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; }
    h3 { margin: 0 0 8px; font-size: 1.25rem; }
    p { margin: 0; }
  `],
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'No results found';
  @Input() message = '';
}
