import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call snackBar.open with toast-success panel class', () => {
    service.success('Done!');
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Done!',
      'Close',
      jasmine.objectContaining({ panelClass: ['toast-success'] })
    );
  });

  it('should call snackBar.open with toast-error class and longer duration', () => {
    service.error('Something went wrong');
    const call = snackBarSpy.open.calls.mostRecent().args[2];
    expect(call?.panelClass).toEqual(['toast-error']);
    expect(call?.duration).toBeGreaterThan(4000);
  });
});
