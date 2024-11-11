import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth.service';
import {LoginConstants} from "../../shared/constants";
import {LoginResponse} from "../../shared/types/response.types";
import {Role} from "../../shared/config/roles.config";


@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  loginForm: FormGroup;
  loading: boolean = false;

  protected readonly LoginConstants = LoginConstants;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;
      this.authService.username.set(username);
      this.authService.login(username, password).subscribe({
        next: (response: LoginResponse) => {
          if (response.code === 200) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userRole', response.role);
            this.authService.userRole.set(response.role as Role);
            this.authService.loggedIn.set(true);
            this.router.navigate([response.role === Role.ADMIN ? '/platform' : '/questions']);
          } else if (response.code === 403) {
            this.showError(response.message);
          }
        },
        error: (error: any) => {
          this.loading = false;
          this.showError(error.error.message);
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'contrast', summary: 'Error', detail: message });
  }
}
