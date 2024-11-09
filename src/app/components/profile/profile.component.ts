import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../shared/services/auth/auth.service";
import { MessageService } from "primeng/api";
import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../environments/environment';

interface UserProfile {
  username: string;
  name: string;
  email: string;
  leetcodeId: string;
  organisation: string;
  country: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  isEditing: boolean = false;
  initialFormValues: any;
  baseUrl: string = "http://localhost:8080";

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private http: HttpClient

  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      leetcodeId: ['', [Validators.required, Validators.minLength(3)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
      organisation: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.profileForm.disable();
  }

  ngOnInit() {
    this.fetchUserProfile();
  }

  fetchUserProfile() {
    const username = this.authService.username;
    this.http.get<any>(`${this.baseUrl}/users/profile/${username}`)
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            const profile = response.user_profile;
            this.profileForm.patchValue({
              username: profile.username,
              fullname: profile.name,
              email: profile.email,
              leetcodeId: profile.leetcodeId,
              country: profile.country,
              organisation: profile.organisation
            });
            this.initialFormValues = this.profileForm.value;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message || 'Failed to fetch profile'
          });
        }
      });
  }

  onEdit() {
    this.isEditing = true;
    this.profileForm.enable();
  }

  onCancel() {
    this.isEditing = false;
    this.profileForm.disable();
    // Reset form to initial values
    this.profileForm.patchValue(this.initialFormValues);
  }

  hasFormChanged(): boolean {
    return JSON.stringify(this.initialFormValues) !== JSON.stringify(this.profileForm.value);
  }

  getChangedValues() {
    const currentValues = this.profileForm.value;
    const changedValues: any = {};

    Object.keys(currentValues).forEach(key => {
      if (currentValues[key] !== this.initialFormValues[key]) {
        changedValues[key] = currentValues[key];
      }
    });

    return changedValues;
  }

  onSave() {
    if (this.profileForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please check all required fields'
      });
      return;
    }

    if (!this.hasFormChanged()) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes',
        detail: 'No changes were made to the profile'
      });
      this.isEditing = false;
      this.profileForm.disable();
      return;
    }

    const changedValues = this.getChangedValues();

    this.http.patch(`${this.baseUrl}/users/update-profile`, changedValues)
      .subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Profile updated successfully'
            });
            this.isEditing = false;
            this.profileForm.disable();
            this.initialFormValues = this.profileForm.value;
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error.message || 'Failed to update profile'
          });
        }
      });
  }

  getFieldError(fieldName: string): string {
    const control = this.profileForm.get(fieldName);
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength']
          .requiredLength} characters`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}
