import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MessageService } from 'primeng/api';
import {of, throwError} from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../services/auth/auth.service';
import {ButtonModule} from "primeng/button";
import {HttpErrorResponse} from "@angular/common/http";
import {Role} from "../../shared/config/roles.config";

describe('LoginFormComponent', () => {
  let component: LoginFormComponent;
  let fixture: ComponentFixture<LoginFormComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    authService = jasmine.createSpyObj('AuthService', ['login', 'loggedIn', 'userRole', 'handleSuccessfulLogin']);
    router = jasmine.createSpyObj('Router', ['navigate']);


    await TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      imports: [
        ReactiveFormsModule,
        InputTextModule,
        PasswordModule,
        ButtonModule,
      ],
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with a form group', () => {
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.get('username')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should mark form as invalid when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should mark form as valid when properly filled', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should call login service on valid form submission', () => {
    const testCredentials = {
      username: 'testuser',
      password: 'password123'
    };

    authService.login.and.returnValue(of({ code: 403, message: "Unauthorized", token: "sa", role: "asdaSawas" }));

    component.loginForm.patchValue(testCredentials);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(
      testCredentials.username,
      testCredentials.password
    );
  });

  it('should not call login service on invalid form', () => {
    component.loginForm.patchValue({
      username: '',
      password: ''
    });
    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });

  it('should show error message on login failure', () => {
    const errorMessage = 'Invalid credentials';
    authService.login.and.returnValue(of({ code: 403, message: errorMessage, role: 'USER', token: "zxzcASDW23Sdsdasd" }));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'wrongpassword'
    });
    component.onSubmit();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage
    });
  });

  it('should handle successful login and navigate', () => {
    const response = { code: 200, role: 'USER', message: "Login successful", token: "xwrrzsfWAdsdardf2312edasdsd" };
    authService.login.and.returnValue(of(response));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    component.onSubmit();

    expect(authService.handleSuccessfulLogin).toHaveBeenCalledWith(response);
    expect(router.navigate).toHaveBeenCalledWith(['/questions']);
  });

  it('should handle unsuccessful login and show error message', () => {
    const response = { code: 401, role: 'USER', message: "Login successful", token: "xwrrzsfWAdsdardf2312edasdsd" };
    const errorResponse = new HttpErrorResponse({
      error : {
        error_code : 1100,
        message: "test"
      },
      status: 401,
    })
    authService.login.and.returnValue(throwError(()=>errorResponse));

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });
    component.onSubmit();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: errorResponse.message
    });
  });

  describe('Initialization Navigation', () => {
    it('should not navigate if user is not logged in', () => {
      authService.loggedIn.and.returnValue(false);

      fixture = TestBed.createComponent(LoginFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(authService.userRole).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to platform if logged in user is admin', () => {
      // Setup spies for logged in admin
      authService.loggedIn.and.returnValue(true);
      authService.userRole.and.returnValue(Role.ADMIN);

      fixture = TestBed.createComponent(LoginFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(authService.loggedIn).toHaveBeenCalled();
      expect(authService.userRole).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/platform']);
    });

    it('should navigate to questions if logged in user is not admin', () => {
      // Setup spies for logged in regular user
      authService.loggedIn.and.returnValue(true);
      authService.userRole.and.returnValue(Role.USER);

      fixture = TestBed.createComponent(LoginFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(authService.loggedIn).toHaveBeenCalled();
      expect(authService.userRole).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/questions']);
    });

    it('should call navigateBasedOnRole with correct role', () => {
      // Setup spies
      authService.loggedIn.and.returnValue(true);
      authService.userRole.and.returnValue(Role.ADMIN);

      // Create spy for navigateBasedOnRole
      spyOn(LoginFormComponent.prototype, 'navigateBasedOnRole');

      fixture = TestBed.createComponent(LoginFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(LoginFormComponent.prototype.navigateBasedOnRole)
        .toHaveBeenCalledWith(Role.ADMIN);
    });

    it('should handle navigation based on role correctly', () => {
      fixture = TestBed.createComponent(LoginFormComponent);
      component = fixture.componentInstance;

      // Test ADMIN role
      component.navigateBasedOnRole(Role.ADMIN);
      expect(router.navigate).toHaveBeenCalledWith(['/platform']);

      // Reset navigate spy
      router.navigate.calls.reset();

      // Test USER role
      component.navigateBasedOnRole(Role.USER);
      expect(router.navigate).toHaveBeenCalledWith(['/questions']);
    });
  });
});
