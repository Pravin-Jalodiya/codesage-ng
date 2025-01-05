import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { MessageService } from 'primeng/api';
import {LoginConstants, MESSAGES} from "../../shared/constants";
import {ForgotPasswordResponse} from "../../shared/types/auth.types";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})

export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email,
      ]),
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.loading = true;
      this.authService.forgotPassword(this.forgotPasswordForm.value.email).subscribe({
        next: (data: ForgotPasswordResponse) => {
          if (data.code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: data.message,
            });
            this.authService.forgotPasswordEmail.set(this.forgotPasswordForm.value.email);
            this.router.navigate(['/reset-password']);
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: MESSAGES.ERROR.OTP_GENERATION_FAILED,
          });
        },
        complete: () => {
          this.loading = false;
          this.forgotPasswordForm.reset()
        }
      });
    }
  }

  protected readonly LoginConstants = LoginConstants;
}
