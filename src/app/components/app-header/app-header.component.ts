import { Component, computed, inject, OnInit } from '@angular/core';

import { Role } from '../../shared/config/roles.config';
import { AuthService } from '../../services/auth/auth.service';
import {HeaderConstants} from "../../shared/constants";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  authService: AuthService = inject(AuthService);
  role = computed((): Role => this.authService.userRole());
  protected readonly Role = Role;

  onLogout(): void {
    this.authService.logout();
  }

  protected readonly HeaderConstants = HeaderConstants;
}
