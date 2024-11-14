import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth.service';
import { LoginConstants } from "../../shared/constants";
import { LoginResponse } from "../../shared/types/auth.types";
import { Role } from "../../shared/config/roles.config";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
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

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.navigateBasedOnRole(this.authService.userRole());
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response: LoginResponse) => {
          this.loading = false;
          if (response.code === 200) {
            this.authService.handleSuccessfulLogin(response);
            this.navigateBasedOnRole(response.role as Role);
          } else if (response.code === 403) {
            this.showError(response.message);
          }
        },
        error: (error: { error: { message: string } }) => {
          this.loading = false;
          this.showError(error.error.message);
        }
      });
    }
  }

  private navigateBasedOnRole(role: Role) {
    this.router.navigate([role === Role.ADMIN ? '/platform' : '/progress']);
  }

  private showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}
