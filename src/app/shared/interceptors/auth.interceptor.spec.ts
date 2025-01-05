import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';
import { EMPTY, of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
      ],
    });
  });

  it('should skip URLs for /signup and /login', () => {
    const mockRequest = new HttpRequest('GET', '/signup');
    const next: HttpHandlerFn = jasmine.createSpy('next').and.returnValue(of({} as HttpEvent<any>));

    const result = AuthInterceptor(mockRequest, next);

    result.subscribe(() => {
      expect(next).toHaveBeenCalledWith(mockRequest);
    });
  });

  it('should navigate to /login if token is missing', () => {
    localStorage.removeItem('authToken');
    const mockRequest = new HttpRequest('GET', '/login');
    const next: HttpHandlerFn = jasmine.createSpy('next').and.returnValue(of({} as HttpEvent<any>));

    const result = AuthInterceptor(mockRequest, next);

    result.subscribe({
      error: () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
        expect(next).not.toHaveBeenCalled();
      },
    });
  });

  it('should add Authorization header if token exists', () => {
    const token = 'testToken';
    localStorage.setItem('authToken', token);
    const mockRequest = new HttpRequest('GET', '/login');
    const next: HttpHandlerFn = jasmine.createSpy('next').and.returnValue(of({} as HttpEvent<any>));

    const result = AuthInterceptor(mockRequest, next);

    result.subscribe(() => {
      expect(next).toHaveBeenCalledWith(
        jasmine.objectContaining({
          headers: jasmine.objectContaining({
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          }),
        })
      );
    });
  });

  it('should handle 401 errors and navigate to /login', () => {
    const token = 'testToken';
    localStorage.setItem('authToken', token);
    const mockRequest = new HttpRequest('GET', '/login');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(throwError(() => new HttpErrorResponse({ status: 401, error: { error_code: 2200 } })));

    const result = AuthInterceptor(mockRequest, next);

    result.subscribe({
      error: () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      },
    });
  });

  it('should handle 403 errors and navigate to /', () => {
    const token = 'testToken';
    localStorage.setItem('authToken', token);
    const mockRequest = new HttpRequest('GET', '/login');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(throwError(() => new HttpErrorResponse({ status: 403, error: { error_code: 9997 } })));

    const result = AuthInterceptor(mockRequest, next);

    result.subscribe({
      error: () => {
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
      },
    });
  });

  it('should re-throw errors for other status codes', () => {
    const token = 'testToken';
    localStorage.setItem('authToken', token);
    const mockRequest = new HttpRequest('GET', '/login');
    const next: HttpHandlerFn = jasmine
      .createSpy('next')
      .and.returnValue(throwError(() => new HttpErrorResponse({ status: 500, error: {} })));

    const result = AuthInterceptor(mockRequest, next);

    result.subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
      },
    });
  });
});
