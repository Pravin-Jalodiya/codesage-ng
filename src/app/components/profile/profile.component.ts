import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import { Router } from "@angular/router";

import {ConfirmationService, MessageService} from "primeng/api";

import {UpdateProfileResponse, UserProfile, UserProfileResponse} from '../../shared/types/profile.types';
import {API_BASE_URL, MESSAGES, UI_CONSTANTS} from '../../shared/constants';
import { UserService } from '../../services/user/user.service';
import { AuthService } from "../../services/auth/auth.service";
import {ErrorResponse} from "../../shared/types/platform.types";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup = this.initializeForm();
  isEditing: boolean = false;
  isLoading: boolean = false;
  initialFormValues: UserProfile | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {
    this.checkAndLoadProfile();
  }

  ngOnInit(): void {}

  private initializeForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullname: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      leetcodeId: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      country: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
      organisation: [{ value: '', disabled: true }, [Validators.required, Validators.minLength(2)]],
    });
  }

  private checkAndLoadProfile(): void {
    const username : string | undefined = this.authService.getUsernameFromToken();
    if (username) {
      this.fetchUserProfile(username);
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchUserProfile(username: string): void {
    this.isLoading = true;

    this.userService.fetchUserProfile(username)
      .subscribe({
        next: (response : UserProfileResponse): void => {
          if (response.code === 200) {
            const profile : UserProfile = response.user_profile;
            // Set initial values
            this.profileForm.patchValue({
              username: profile.username,
              fullname: profile.name,
              email: profile.email,
              leetcodeId: profile.leetcodeId,
              country: profile.country,
              organisation: profile.organisation,
            });
            this.initialFormValues = { ...profile };
            this.setFormState(false);
          }
        },
        error: (error: ErrorResponse) : void => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: MESSAGES.ERROR.LOADING_PROFILE,
          });
        },
        complete: (): void => {
          this.isLoading = false;
        }
      });
  }

  onEdit(): void {
    this.setFormState(true);
  }

  onCancel(): void {
    if (this.hasFormChanged()) {
      this.confirmationService.confirm({
        message: MESSAGES.CONFIRM.UNSAVED_CHANGES,
        header: 'Unsaved Changes',
        icon: UI_CONSTANTS.ICONS.INFO_CIRCLE,
        acceptButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.DANGER_TEXT,
        rejectButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.TEXT,
        acceptIcon: 'none',
        rejectIcon: 'none',
        accept: (): void => {
          this.resetForm();
        },
      });
    } else {
      this.resetForm();
    }
  }

  private resetForm(): void {
    if (this.initialFormValues) {
      this.profileForm.patchValue({
        username: this.initialFormValues.username,
        fullname: this.initialFormValues.name,
        email: this.initialFormValues.email,
        leetcodeId: this.initialFormValues.leetcodeId,
        country: this.initialFormValues.country,
        organisation: this.initialFormValues.organisation,
      });
    }
    this.setFormState(false);
  }

  private setFormState(editing: boolean): void {
    this.isEditing = editing;

    // Always keep leetcodeId disabled
    this.profileForm.get('leetcodeId')?.disable();

    // Handle other form controls
    Object.keys(this.profileForm.controls).forEach(key => {
      if (key !== 'leetcodeId') {
        const control = this.profileForm.get(key);
        if (control) {
          editing ? control.enable() : control.disable();
        }
      }
    });
  }

  hasFormChanged(): boolean {
    if (!this.initialFormValues) return false;

    const currentValues = this.profileForm.getRawValue();
    return Object.keys(currentValues).some(key => {
      if (key === 'leetcodeId') return false;
      if (key === 'fullname') {
        return currentValues[key] !== this.initialFormValues?.name;
      }
      return currentValues[key] !== this.initialFormValues?.[key as keyof UserProfile];
    });
  }

  onSave(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: MESSAGES.ERROR.VALIDATION_ERROR
      });
      return;
    }

    if (!this.hasFormChanged()) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: MESSAGES.INFO.NO_CHANGES
      });
      this.setFormState(false);
      return;
    }

    const changedValues: Partial<UserProfile>  = this.getChangedValues();
    this.updateProfile(changedValues);
  }

  private updateProfile(changedValues: Partial<UserProfile>): void {
    this.isLoading = true;

      this.userService.updateUserProfile(changedValues).subscribe({
        next: (response: UpdateProfileResponse): void => {
          if (response.code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: MESSAGES.SUCCESS.PROFILE_UPDATE
            });
            const currentValues = this.profileForm.getRawValue();
            this.initialFormValues = {
              ...this.initialFormValues,
              ...currentValues,
              name: currentValues.fullname
            } as UserProfile;
            this.setFormState(false);
          }
        },
        error: (error: ErrorResponse) : void => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || MESSAGES.ERROR.PROFILE_UPDATE_FAILED
          });
        },
        complete: (): void => {
          this.isLoading = false;
        }
      });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getChangedValues(): Partial<UserProfile> {
    const currentValues = this.profileForm.getRawValue();
    const changedValues: Partial<UserProfile> = {};

    Object.keys(currentValues).forEach(key => {
      if (key === 'leetcodeId') return;

      if (key === 'fullname') {
        if (currentValues[key] !== this.initialFormValues?.name) {
          changedValues.name = currentValues[key];
        }
      } else if (currentValues[key] !== this.initialFormValues?.[key as keyof UserProfile]) {
        changedValues[key as keyof UserProfile] = currentValues[key];
      }
    });

    return changedValues;
  }

  getFieldError(fieldName: string): string {
    const control :  AbstractControl<any, any> | null = this.profileForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase()
          + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['email']) {
        return MESSAGES.ERROR.VALIDATION_ERROR;
      }
    }
    return '';
  }
}
