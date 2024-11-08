import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Router} from "@angular/router";

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})

export class LoginFormComponent {
  loginForm: FormGroup;

  err: string | undefined;

  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private messageService: MessageService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (response: any) => {
          console.log('Login successful:', response);
          if (response.code === 200) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userRole', response.role);
            this.authService.userRole = response.role;
            this.router.navigate(['/questions']);
        }},
        error: (error: any) => {
          this.loading = false;
          console.error('Login failed', error);
          this.showError(error.error.message);

        },
        complete: () => {
          this.loading = false;
          console.log('Login request complete');
        }
      });
    }
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'contrast', summary: 'Error', detail: message });
  }

}
