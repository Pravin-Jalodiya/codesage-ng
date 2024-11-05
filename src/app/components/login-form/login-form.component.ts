import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})

export class LoginFormComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response: any) => {
          console.log('Login successful:', response);
          if (response.code === 200) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userRole', response.role);
        }},
        error: (error: any) => {
          console.error('Login failed', error);
          // handle error logic here
        },
        complete: () => {
          console.log('Login request complete');
        }
      });
    }
  }
}
