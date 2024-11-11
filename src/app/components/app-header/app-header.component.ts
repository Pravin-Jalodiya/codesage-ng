import {Component, computed, inject, OnInit} from '@angular/core';
import {Role} from "../../shared/config/roles.config";
import {AuthService} from "../../services/auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  authService: AuthService = inject(AuthService);
  role = computed(() => this.authService.userRole());
  protected readonly Role = Role;

  onLogout(){
    this.authService.logout();
  }
}
