import { Component, computed, inject, OnInit } from '@angular/core';

import { Role } from '../../shared/config/roles.config';
import { AuthService } from '../../services/auth/auth.service';
import {HeaderConstants} from "../../shared/constants";
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  router = inject(Router)
  authService: AuthService = inject(AuthService);
  role = computed((): Role => this.authService.userRole());
  isAdmin = computed(()=> this.role()=== Role.ADMIN);
  protected readonly Role = Role;

  onLogout(): void {
    this.authService.logout().subscribe({
      next: (response: any) => {
        if (response.code === 200) {
        }
      },
    });

    this.authService.loggedIn.set(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login'])
  }

  protected readonly HeaderConstants = HeaderConstants;
}
