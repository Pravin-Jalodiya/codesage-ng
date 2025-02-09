import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { AuthService } from '../../services/auth/auth.service';
import { LoginConstants } from "../../shared/constants";
import { LoginResponse } from "../../shared/types/auth.types";
import { Role } from "../../shared/config/roles.config";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;

  protected readonly LoginConstants : typeof LoginConstants = LoginConstants;

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

  ngOnInit() : void {
    if (this.authService.loggedIn()) {
      this.navigateBasedOnRole(this.authService.userRole());
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      const { username, password } = this.loginForm.value;

      this.authService.login(username, password).subscribe({
        next: (response: LoginResponse) : void => {
          this.loading = false;
          if (response.code === 200) {
            this.authService.handleSuccessfulLogin(response);
            this.navigateBasedOnRole(response.role as Role);
          } else if (response.code === 403) {
            this.showError(response.message);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.showError(error.error.message);
        }
      });
    }
  }

  navigateBasedOnRole(role: Role) {
    this.router.navigate([role === Role.ADMIN ? '/platform' : '/questions']);
  }

  private showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}
