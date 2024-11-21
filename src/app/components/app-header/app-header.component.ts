import {Component, computed, inject, Signal} from '@angular/core';
import { Router } from '@angular/router';

import { Role } from '../../shared/config/roles.config';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderConstants } from "../../shared/constants";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  router = inject(Router);
  authService: AuthService = inject(AuthService);
  role : Signal <Role> = computed((): Role => this.authService.userRole());
  isAdmin : Signal<boolean> = computed(() : boolean => this.role() === Role.ADMIN);
  protected readonly Role = Role;

  onLogout(): void {
    this.authService.logout().subscribe();
    this.authService.loggedIn.set(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  protected readonly HeaderConstants : typeof HeaderConstants = HeaderConstants;
}
