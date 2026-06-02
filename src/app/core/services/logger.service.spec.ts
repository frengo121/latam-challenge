import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
    spyOn(console, 'log').and.stub();
    spyOn(console, 'warn').and.stub();
    spyOn(console, 'error').and.stub();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should always call console.error regardless of environment', () => {
    service['isProduction'] = true;
    service.error('critical failure');
    expect(console.error).toHaveBeenCalledWith('critical failure');
  });

  it('should NOT call console.log in production mode', () => {
    service['isProduction'] = true;
    service.log('debug info');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should call console.log in development mode', () => {
    service['isProduction'] = false;
    service.log('debug info');
    expect(console.log).toHaveBeenCalledWith('debug info');
  });
});
