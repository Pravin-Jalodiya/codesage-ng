import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../services/auth/auth.service';
import { LoginConstants, MESSAGES } from '../../shared/constants';
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup = this.initializeForm();
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.checkForgotPasswordEmail();
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/)
      ]],
      confirmPassword: ['', [Validators.required]],
      otp: ['', [
        Validators.required,
        Validators.pattern(/^\d{6}$/),
        Validators.minLength(6),
        Validators.maxLength(6)
      ]]
    }, { validators: this.passwordMatchValidator });
  }

  private checkForgotPasswordEmail(): void {
    if (this.authService.forgotPasswordEmail() === '') {
      this.router.navigate(['forgot-password']);
    }
  }

  private passwordMatchValidator(group: FormGroup): null | { passwordMismatch: true } {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getPasswordError(): string {
    const control = this.resetPasswordForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) {
        return 'Password is required';
      }
      if (control.errors['minlength']) {
        return `Password must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character';
      }
    }
    return '';
  }

  getOtpError(): string {
    const control = this.resetPasswordForm.get('otp');
    if (!control) return '';

    if (control.touched && control.errors) {
      if (control.errors['required']) {
        return 'OTP is required';
      }
      if (control.errors['minlength'] || control.errors['maxlength'] || control.errors['pattern']) {
        return 'OTP must be 6 digits';
      }
    }
    return '';
  }

  passwordMismatch(): boolean {
    return this.resetPasswordForm.errors?.['passwordMismatch']
      && (this.resetPasswordForm.get('confirmPassword')?.touched ?? false);
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.markFormGroupTouched(this.resetPasswordForm);
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: MESSAGES.ERROR.VALIDATION_ERROR
      });
      return;
    }

    this.isLoading = true;
    const { password, otp } = this.resetPasswordForm.value;

    this.authService.resetPassword(password, otp.toString()).subscribe({
      next: (response: { code: number; message: string }): void => {
        if (response.code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message
          });
          this.authService.forgotPasswordEmail.set('');
          this.router.navigate(['login']);
        }
      },
      error: (error: HttpErrorResponse): void => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message || MESSAGES.ERROR.RESET_PASSWORD_FAILED
        });
        this.router.navigate(['/forgot-password']);
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

  protected readonly LoginConstants = LoginConstants;
}
