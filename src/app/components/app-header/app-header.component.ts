import {Component, computed, inject, Signal} from '@angular/core';
import { Router } from '@angular/router';

import { Role } from '../../shared/config/roles.config';
import { AuthService } from '../../services/auth/auth.service';
import {HeaderConstants, MESSAGES} from "../../shared/constants";
import {ProfileComponent} from "../profile/profile.component";
import {UserService} from "../../services/user/user.service";
import {UserProfileResponse} from "../../shared/types/profile.types";

import {MessageService} from "primeng/api";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss']
})
export class AppHeaderComponent {
  router: Router = inject(Router);
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  messageService: MessageService = inject(MessageService);
  role : Signal <Role> = computed((): Role => this.authService.userRole());
  protected readonly Role = Role;
  userAvatar: Signal<string> = computed(() : string => this.userService.userAvatar());

  ngOnInit(): void {
    this.checkAndLoadProfile();
  }

  checkAndLoadProfile(): void {
    const username : string | undefined = this.authService.getUsernameFromToken();
    if (username) {
      this.fetchUserProfile(username);
    } else {
      this.router.navigate(['/login']);
    }
  }

  fetchUserProfile(username: string): void {
    this.userService.fetchUserProfile(username)
      .subscribe({
        next: (response : UserProfileResponse): void => {
          if (response.code === 200) {
            const avatar : string = response.user_profile.avatar;
            this.userService.userAvatar.update((default_avatar : string) => avatar);
          }
        },
        error: (error: HttpErrorResponse) : void => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: MESSAGES.ERROR.LOADING_AVATAR,
          });
        },
      });
  }

  onLogout(): void {
    this.authService.logout().subscribe();
    this.authService.loggedIn.set(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }

  protected readonly HeaderConstants : typeof HeaderConstants = HeaderConstants;
  protected readonly ProfileComponent = ProfileComponent;
}
