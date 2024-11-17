import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PlatformStatsResponse } from '../../shared/types/platform.types';
import { API_ENDPOINTS, PLATFORM_PATHS } from '../../shared/constants';
import { UpdateProfileResponse, UserProfile, UserProfileResponse } from '../../shared/types/profile.types';
import { UserBanToggleResponse, UsersListResponse } from '../../shared/types/user.types';
import { NoBodyResponse } from '../../shared/types/question.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor( private http: HttpClient,
    private messageService: MessageService,
    private router: Router) {}

    getUsers(): Observable<UsersListResponse>{
      return this.http.get<UsersListResponse>(API_ENDPOINTS.USERS.LIST)
    }

    toggleUserBanState(username: string, reqBody: {}): Observable<UserBanToggleResponse>{
      return this.http.patch<UserBanToggleResponse>(
        API_ENDPOINTS.USERS.BAN(username),
        {}
      )
    }

    deleteUser(username: string): Observable<NoBodyResponse>{
        return this.http.delete<NoBodyResponse>(API_ENDPOINTS.USERS.DELETE(username));
    }

    fetchPlatformStats(): Observable<PlatformStatsResponse>{
      return this.http.get<PlatformStatsResponse>(PLATFORM_PATHS.PLATFORM_STATS);
    }

    fetchUserProfile(url: string): Observable<UserProfileResponse>{
      return this.http.get<UserProfileResponse>(url);
    }

    updateUserProfile(url:string, changedValues: Partial<UserProfile>): Observable<UpdateProfileResponse>{
      return this.http.patch<UpdateProfileResponse>(url, changedValues);
    }

    // getUserProgress(): Observable<userPro
}
