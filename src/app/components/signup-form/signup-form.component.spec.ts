import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupFormComponent } from './signup-form.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { PasswordModule } from "primeng/password";
import { InputTextModule } from "primeng/inputtext";
import { AuthService } from "../../services/auth/auth.service";
import { MessageService } from "primeng/api";
import { Router } from "@angular/router";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { of, throwError } from 'rxjs';
import { MESSAGES } from "../../shared/constants";

describe('SignupFormComponent', () => {
  let component: SignupFormComponent;
  let fixture: ComponentFixture<SignupFormComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['signup']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [SignupFormComponent],
      imports: [
        ReactiveFormsModule,
        ButtonModule,
        PasswordModule,
        InputTextModule
      ],
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize with a form group', () => {
      expect(component.signupForm).toBeTruthy();
      expect(component.signupForm.get('username')).toBeTruthy();
      expect(component.signupForm.get('password')).toBeTruthy();
      expect(component.signupForm.get('fullName')).toBeTruthy();
      expect(component.signupForm.get('confirmPassword')).toBeTruthy();
      expect(component.signupForm.get('email')).toBeTruthy();
      expect(component.signupForm.get('country')).toBeTruthy();
      expect(component.signupForm.get('leetcodeId')).toBeTruthy();
      expect(component.signupForm.get('organization')).toBeTruthy();
    });

    it('should initialize with empty form values', () => {
      const formValues = component.signupForm.value;
      expect(formValues).toEqual({
        username: '',
        password: '',
        fullName: '',
        confirmPassword: '',
        email: '',
        country: '',
        leetcodeId: '',
        organization: ''
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const form = component.signupForm;
      expect(form.valid).toBeFalsy();

      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        expect(control?.errors?.['required']).toBeTruthy();
        expect(control?.valid).toBeFalsy();
      });
    });

    it('should validate username minimum length', () => {
      const usernameControl = component.signupForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.errors?.['minlength']).toBeTruthy();

      usernameControl?.setValue('abc');
      expect(usernameControl?.errors?.['minlength']).toBeFalsy();
    });

    it('should validate password minimum length', () => {
      const passwordControl = component.signupForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.errors?.['minlength']).toBeTruthy();

      passwordControl?.setValue('123456');
      expect(passwordControl?.errors?.['minlength']).toBeFalsy();
    });

    it('should validate email format', () => {
      const emailControl = component.signupForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.errors?.['email']).toBeTruthy();

      emailControl?.setValue('valid@email.com');
      expect(emailControl?.errors?.['email']).toBeFalsy();
    });

    it('should validate password match', () => {
      const form = component.signupForm;
      form.get('password')?.setValue('password123');
      form.get('confirmPassword')?.setValue('password456');
      expect(form.errors?.['mustMatch']).toBeTruthy();

      form.get('confirmPassword')?.setValue('password123');
      expect(form.errors?.['mustMatch']).toBeFalsy();
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      username: 'testuser',
      password: 'password123',
      fullName: 'Test User',
      confirmPassword: 'password123',
      email: 'test@example.com',
      country: 'TestCountry',
      leetcodeId: 'leetcode123',
      organization: 'TestOrg'
    };

    beforeEach(() => {
      Object.keys(validFormData).forEach(key => {
        component.signupForm.get(key)?.setValue(validFormData[key as keyof typeof validFormData]);
      });
    });

    it('should not submit if form is invalid', () => {
      component.signupForm.get('email')?.setValue('invalid-email');
      component.onSubmit();
      expect(authService.signup).not.toHaveBeenCalled();
    });

    it('should show success message and navigate to login on successful signup', fakeAsync(() => {
      const successResponse = { code: 200, message: 'Success', user_info : {
        role: 'USER',
        username: 'testuser'
        } };
      authService.signup.and.returnValue(of(successResponse));

      component.onSubmit();
      tick();

      expect(authService.signup).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Signup Successful',
        detail: MESSAGES.SUCCESS.SIGNUP
      });
      expect(component.loading).toBeFalse();
    }));

    it('should handle signup error with custom message', fakeAsync(() => {
      const errorResponse = { error: { message: 'Custom error message' } };
      authService.signup.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(authService.signup).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Custom error message'
      });
      expect(component.loading).toBeFalse();
    }));

    it('should handle signup error with default message', fakeAsync(() => {
      const errorResponse = { error: {} };
      authService.signup.and.returnValue(throwError(() => errorResponse));

      component.onSubmit();
      tick();

      expect(authService.signup).toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: MESSAGES.ERROR.SIGNUP_FAILED
      });
      expect(component.loading).toBeFalse();
    }));
  });

  describe('Error Handling', () => {
    it('should show error message', () => {
      const errorMessage = 'Test error message';
      component.showError(errorMessage);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage
      });
    });
  });
});
