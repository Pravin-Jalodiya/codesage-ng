import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import {Confirmation, ConfirmationService, MessageService} from 'primeng/api';
import { UserService } from '../../services/user/user.service';
import { ProfileComponent } from "./profile.component";
import { AuthService } from "../../services/auth/auth.service";
import { MESSAGES } from '../../shared/constants';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let confirmationService: jasmine.SpyObj<ConfirmationService>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockUserProfile = {
    username: 'testuser',
    name: 'Test User',
    email: 'test@example.com',
    leetcodeId: 'leetcode123',
    organisation: 'TestOrg',
    country: 'TestCountry',
    password: 'password123',
    avatar: 'avatar.png'
  };

  beforeEach(async () => {
    userService = jasmine.createSpyObj('UserService', ['fetchUserProfile', 'updateUserProfile']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    confirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    authService = jasmine.createSpyObj('AuthService', ['getUsernameFromToken']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: MessageService, useValue: messageService },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();

  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
      userService.fetchUserProfile.and.returnValue(of({
        code: 200,
        message: 'Success',
        user_profile: mockUserProfile
      }));

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
    });

    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    // it('should redirect to login if no username in token', () => {
    //   authService.getUsernameFromToken.and.returnValue(undefined);
    //   fixture.detectChanges();
    //   expect(router.navigate).toHaveBeenCalledWith(['/login']);
    // });

    it('should load user profile on initialization', fakeAsync(() => {
      fixture.detectChanges();
      tick();

      expect(userService.fetchUserProfile).toHaveBeenCalledWith('testuser');
      expect(component.profileForm.getRawValue()).toEqual({
        username: mockUserProfile.username,
        fullname: mockUserProfile.name,
        email: mockUserProfile.email,
        leetcodeId: mockUserProfile.leetcodeId,
        country: mockUserProfile.country,
        organisation: mockUserProfile.organisation
      });
    }));

    // it('should handle profile loading error', fakeAsync(() => {
    //   userService.fetchUserProfile.and.returnValue(throwError(() => ({
    //     error_code: 500,
    //     message: 'Error loading profile'
    //   })));
    //
    //   fixture.detectChanges();
    //   tick();
    //
    //   expect(messageService.add).toHaveBeenCalledWith({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: MESSAGES.ERROR.LOADING_PROFILE
    //   });
    // }));
  });

  describe('Form Interaction', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
      userService.fetchUserProfile.and.returnValue(of({
        code: 200,
        message: 'Success',
        user_profile: mockUserProfile
      }));

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should enable form editing on edit button click', () => {
      component.onEdit();
      expect(component.isEditing).toBeTrue();
      expect(component.profileForm.get('username')?.enabled).toBeTrue();
      expect(component.profileForm.get('leetcodeId')?.disabled).toBeTrue();
    });

    it('should handle form cancellation with no changes', () => {
      component.onEdit();
      component.onCancel();
      expect(component.isEditing).toBeFalse();
    });

    it('should show confirmation dialog when cancelling with changes', () => {
      component.onEdit();
      component.profileForm.patchValue({ username: 'newusername' });
      component.onCancel();

      expect(confirmationService.confirm).toHaveBeenCalled();
      const confirmConfig = confirmationService.confirm.calls.first().args[0];
      expect(confirmConfig.message).toBe(MESSAGES.CONFIRM.UNSAVED_CHANGES);
    });

    it('should reset form when confirmed', () => {
      component.onEdit();
      component.profileForm.patchValue({ username: 'newusername' });

      confirmationService.confirm.and.callFake((confirmation: Confirmation) => {
        if (confirmation.accept) {
          confirmation.accept();
        }
        return confirmationService;
      });

      component.onCancel();
      expect(component.profileForm.get('username')?.value).toBe(mockUserProfile.username);
    });
  });

  describe('Form Validation and Submission', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
      userService.fetchUserProfile.and.returnValue(of({
        code: 200,
        message: 'Success',
        user_profile: mockUserProfile
      }));

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show validation errors when submitting invalid form', () => {
      component.onEdit();
      component.profileForm.patchValue({ username: '' });
      component.onSave();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Validation Error',
        detail: MESSAGES.ERROR.VALIDATION_ERROR
      });
    });

    it('should show message when no changes made', () => {
      component.onEdit();
      component.onSave();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'No Changes',
        detail: MESSAGES.INFO.NO_CHANGES
      });
    });

    it('should successfully update profile', fakeAsync(() => {
      userService.updateUserProfile.and.returnValue(of({
        code: 200,
        message: 'Success'
      }));

      component.onEdit();
      component.profileForm.patchValue({ username: 'newusername' });
      component.onSave();
      tick();

      expect(userService.updateUserProfile).toHaveBeenCalledWith({ username: 'newusername' });
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Success',
        detail: MESSAGES.SUCCESS.PROFILE_UPDATE
      });
    }));

    it('should handle update error', fakeAsync(() => {
      userService.updateUserProfile.and.returnValue(throwError(() => ({
        error_code: 500,
        message: 'Update failed'
      })));

      component.onEdit();
      component.profileForm.patchValue({ username: 'newusername' });
      component.onSave();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Update failed'
      });
    }));
  });

  describe('Form Error Handling', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
      userService.fetchUserProfile.and.returnValue(of({
        code: 200,
        message: 'Success',
        user_profile: mockUserProfile
      }));

      fixture = TestBed.createComponent(ProfileComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should show required field error', () => {
      component.onEdit();
      const usernameControl = component.profileForm.get('username');
      usernameControl?.setValue('');
      usernameControl?.markAsTouched();

      expect(component.getFieldError('username')).toBe('Username is required');
    });

    it('should show minlength error', () => {
      component.onEdit();
      const usernameControl = component.profileForm.get('username');
      usernameControl?.setValue('ab');
      usernameControl?.markAsTouched();

      expect(component.getFieldError('username')).toContain('must be at least');
    });

    it('should show email validation error', () => {
      component.onEdit();
      const emailControl = component.profileForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      expect(component.getFieldError('email')).toBe(MESSAGES.ERROR.VALIDATION_ERROR);
    });
  });
});
