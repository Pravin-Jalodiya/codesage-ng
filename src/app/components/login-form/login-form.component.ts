import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {Router} from "@angular/router";

import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
})

export class LoginFormComponent {
  loginForm: FormGroup;

  loading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private messageService: MessageService, private router: Router) {
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
        next: (response: any) => {
          if (response.code === 200) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userRole', response.role);
            this.authService.userRole.set(response.role);
            this.authService.loggedIn.set(true);
            if(response.role === 'admin') {
              this.router.navigate(['/platform']);
            } else {
              this.router.navigate(['/questions']);
            }
        }
          if(response.code === 403) {
            this.showError(response.message);
          }
          },
        error: (error: any) => {
          this.loading = false;
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
