import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  template: `
    @if (type === 'table') {
      <div class="skeleton-wrapper" role="status" aria-label="Loading users...">
        <div class="skeleton-header">
          <div class="skeleton-bar w-20"></div>
          <div class="skeleton-bar w-30"></div>
          <div class="skeleton-bar w-10"></div>
          <div class="skeleton-bar w-10"></div>
          <div class="skeleton-bar w-8"></div>
        </div>
        @for (row of rowArray; track row) {
          <div class="skeleton-row">
            <div class="skeleton-bar w-20"></div>
            <div class="skeleton-bar w-30"></div>
            <div class="skeleton-chip"></div>
            <div class="skeleton-chip narrow"></div>
            <div class="skeleton-icon"></div>
          </div>
        }
      </div>
    } @else {
      <div class="skeleton-wrapper card-skeleton" role="status" aria-label="Loading...">
        <div class="skeleton-bar title-bar"></div>
        <div class="skeleton-bar subtitle-bar"></div>
        <div class="skeleton-divider"></div>
        @for (row of rowArray; track row) {
          <div class="skeleton-field-row">
            <div class="skeleton-bar label-bar"></div>
            <div class="skeleton-bar value-bar"></div>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      @keyframes shimmer {
        0% {
          background-position: -400px 0;
        }
        100% {
          background-position: 400px 0;
        }
      }

      .skeleton-bar,
      .skeleton-chip,
      .skeleton-icon {
        background: linear-gradient(90deg, #e8e8e8 0px, #f5f5f5 40px, #e8e8e8 80px);
        background-size: 400px 100%;
        animation: shimmer 1.4s ease-in-out infinite;
        border-radius: 4px;
      }

      /* Table skeleton */
      .skeleton-header,
      .skeleton-row {
        display: flex;
        align-items: center;
        gap: 24px;
        padding: 14px 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .skeleton-header {
        opacity: 0.5;
      }

      .skeleton-bar {
        height: 14px;
        flex-shrink: 0;
      }

      .w-8 {
        width: 8%;
      }
      .w-10 {
        width: 10%;
      }
      .w-20 {
        width: 20%;
      }
      .w-30 {
        width: 30%;
      }

      .skeleton-chip {
        height: 22px;
        width: 70px;
        border-radius: 12px;
        flex-shrink: 0;
      }

      .skeleton-chip.narrow {
        width: 52px;
      }

      .skeleton-icon {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      /* Card skeleton */
      .card-skeleton {
        padding: 24px 16px;
      }

      .title-bar {
        height: 24px;
        width: 40%;
        margin-bottom: 12px;
      }

      .subtitle-bar {
        height: 14px;
        width: 22%;
        margin-bottom: 28px;
      }

      .skeleton-divider {
        height: 1px;
        background: #f0f0f0;
        margin-bottom: 20px;
      }

      .skeleton-field-row {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-bottom: 18px;
      }

      .label-bar {
        height: 13px;
        width: 120px;
        flex-shrink: 0;
      }

      .value-bar {
        height: 13px;
        flex: 1;
        max-width: 260px;
      }

      /* Dark mode */
      :host-context(.dark-theme) {
        .skeleton-bar,
        .skeleton-chip,
        .skeleton-icon {
          background: linear-gradient(90deg, #2a2a2a 0px, #3d3d3d 40px, #2a2a2a 80px);
          background-size: 400px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
        }

        .skeleton-header,
        .skeleton-row {
          border-bottom-color: rgba(255, 255, 255, 0.08);
        }

        .skeleton-divider {
          background: rgba(255, 255, 255, 0.08);
        }
      }
    `,
  ],
})
export class LoadingSkeletonComponent {
  @Input() type: 'table' | 'card' = 'card';
  @Input() rows = 5;

  get rowArray(): number[] {
    return Array.from({ length: this.rows }, (_, i) => i);
  }
}
