import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useValue: AuthInterceptor,
          multi: true,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add an Authorization header', () => {
    localStorage.setItem('authToken', '12345');

    httpClient.get('/test').subscribe();

    const httpRequest = httpMock.expectOne('/test');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(true);
    expect(httpRequest.request.headers.get('Authorization')).toEqual('Bearer 12345');
  });

  it('should not add an Authorization header to skipUrls', () => {
    httpClient.post('/login', {}).subscribe();

    const httpRequest = httpMock.expectOne('/login');
    expect(httpRequest.request.headers.has('Authorization')).toEqual(false);
  });

  it('should navigate to login if no token is present', () => {
    localStorage.removeItem('authToken');

    httpClient.get('/test').subscribe({
      error: () => {}
    });

    const httpRequest = httpMock.expectOne('/test');
    httpRequest.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to login for 401 error with error_code 2200', () => {
    localStorage.setItem('authToken', '12345');

    httpClient.get('/test').subscribe({
      error: () => {}
    });

    const httpRequest = httpMock.expectOne('/test');
    httpRequest.flush({ error_code: 2200 }, { status: 401, statusText: 'Unauthorized' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should navigate to home for 403 error with error_code 9997', () => {
    localStorage.setItem('authToken', '12345');

    httpClient.get('/test').subscribe({
      error: () => {}
    });

    const httpRequest = httpMock.expectOne('/test');
    httpRequest.flush({ error_code: 9997 }, { status: 403, statusText: 'Forbidden' });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
