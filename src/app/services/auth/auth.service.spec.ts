import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GetRoleResponse,
  LogoutResponse
} from '../../shared/types/auth.types';
import { AUTH_PATHS } from '../../shared/constants';
import jwtDecode from 'jwt-decode';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  // Mocking jwtDecode function globally for tests
  const mockJwtDecode = (token: string) => {
    if (token === 'valid-token') {
      return {
        username: 'testUser',
        exp: Date.now() / 1000 + 3600, // Valid for the next hour
        userId: '12345',
        role: 'user',
        banState: false,
      };
    }
    throw new Error('Invalid token');
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Override the jwtDecode globally with the mock implementation
    spyOn<any>(jwtDecode, 'default').and.callFake(mockJwtDecode);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#login', () => {
    it('should perform a login request', () => {
      const loginResponse: LoginResponse = { code: 200, message: 'OK', role: 'user', token: 'valid-token' };
      const loginPayload: LoginRequest = { username: 'test', password: 'test' };

      service.login(loginPayload.username, loginPayload.password).subscribe(response => {
        expect(response).toEqual(loginResponse);
      });

      const req = httpMock.expectOne(AUTH_PATHS.LOGIN);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginPayload);
      req.flush(loginResponse);
    });
  });

  describe('#signup', () => {
    it('should perform a signup request', () => {
      const signupResponse: SignupResponse = {
        code: 200,
        message: 'Signup Successful',
        user_info: { role: 'user', username: 'testUser' }
      };
      const signupData: SignupRequest = {
        username: 'test',
        password: 'test',
        name: 'Test User',
        email: 'test@example.com',
        organisation: 'Test Org',
        country: 'Test Country',
        leetcode_id: 'testLeetCode'
      };

      service.signup(signupData).subscribe(response => {
        expect(response).toEqual(signupResponse);
      });

      const req = httpMock.expectOne(AUTH_PATHS.SIGNUP);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signupData);
      req.flush(signupResponse);
    });
  });

  describe('#getRole', () => {
    it('should fetch the user role', () => {
      const roleResponse: GetRoleResponse = { code: 200, message: 'OK', role: 'admin' };

      service.getRole().subscribe(response => {
        expect(response).toEqual(roleResponse);
      });

      const req = httpMock.expectOne(AUTH_PATHS.ROLE);
      expect(req.request.method).toBe('GET');
      req.flush(roleResponse);
    });
  });

  describe('#logout', () => {
    it('should perform a logout request', () => {
      const logoutResponse: LogoutResponse = { code: 200, message: 'Logged out successfully' };

      service.logout().subscribe(response => {
        expect(response).toEqual(logoutResponse);
      });

      const req = httpMock.expectOne(AUTH_PATHS.LOGOUT);
      expect(req.request.method).toBe('POST');
      req.flush(logoutResponse);
    });
  });

  it('should handle errors correctly and navigate to login', () => {
    const errorMessage = 'An error occurred';

    service.handleError({ error: { message: errorMessage } });

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
    });

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return the user ID from a valid token', () => {
    localStorage.setItem('authToken', 'valid-token');
    expect(service.getUserIdFromToken()).toBe('12345');
  });
});
