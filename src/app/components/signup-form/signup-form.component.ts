import { Component, OnInit } from '@angular/core';
import { FormBuilder,
         FormGroup,
         Validators,
         AbstractControl,
         ValidationErrors,
         ValidatorFn,
         AbstractControlOptions } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth.service';
import { SignupRequest, SignupResponse } from "../../shared/types/auth.types";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})
export class SignupFormComponent implements OnInit {
  signupForm: FormGroup;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      fullName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      leetcodeId: ['', [Validators.required]],
      country: ['', [Validators.required]],
      organization: ['', [Validators.required]],
    }, {
      validators: this.passwordMatchValidator
    } as AbstractControlOptions);
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      const { username, password, fullName, email, organization, country, leetcodeId } = this.signupForm.value;
      const signupData: SignupRequest = {
        username,
        password,
        name: fullName,
        email,
        organisation: organization,
        country,
        leetcode_id: leetcodeId
      };

      this.authService.signup(signupData).subscribe({
        next: (response: SignupResponse): void => {
          this.loading = false;
          if (response.code === 200) {
            this.router.navigate(['/login']);
            this.messageService.add({
              severity: 'info',
              summary: 'Signup Successful',
              detail: 'Your account has been created!'
            });
          }
        },
        error: (error: HttpErrorResponse): void => {
          this.loading = false;
          this.showError(error.error.message ?? 'Signup failed. Please try again.');
        }
      });
    }
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mustMatch: true };
  };
}
