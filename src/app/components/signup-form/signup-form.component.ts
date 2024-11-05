import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  AbstractControlOptions
} from '@angular/forms';

import {AuthService} from "../../shared/services/auth/auth.service";
import {MessageService} from "primeng/api";

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})

export class SignupFormComponent implements OnInit {
  signupForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService, private messageService: MessageService) {
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
      const { username, password, fullName, email, organization, country, leetcodeId } = this.signupForm.value;
      this.authService.signup(username, password, fullName, email, organization, country, leetcodeId).subscribe({
        next: (response: any) => {
          if (response.code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Signup Successful',
              detail: 'Your account has been created!'
            });
          }
        },
        error: (error: any) => {
          console.error('Signup failed', error);
          this.showError(error.error.message || 'Signup failed. Please try again.');
        },
        complete: () => {
          console.log('Signup request complete');
        }
      });
    }
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'contrast', summary: 'Error', detail: message });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { mustMatch: true };
  };
}
