import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

import { PlatformStatsResponse } from '../../shared/types/platform.types';
import {API_ENDPOINTS, PLATFORM_PATHS} from '../../shared/constants';
import { UpdateProfileResponse, UserProfile, UserProfileResponse } from '../../shared/types/profile.types';
import {UserBanToggleResponse, UserProgressResponse, UsersListResponse} from '../../shared/types/user.types';
import { NoBodyResponse } from '../../shared/types/question.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor( private http: HttpClient,
    private messageService: MessageService,
    private router: Router) {}

    getUsers(): Observable<UsersListResponse>{
      return this.http.get<UsersListResponse>(API_ENDPOINTS.BASE_URL + API_ENDPOINTS.USERS.LIST)
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

    fetchUserProfile(username: string): Observable<UserProfileResponse>{
      return this.http.get<UserProfileResponse>(API_ENDPOINTS.USERS.PROFILE(username));
    }

    updateUserProfile(changedValues: Partial<UserProfile>): Observable<UpdateProfileResponse>{
      return this.http.patch<UpdateProfileResponse>(API_ENDPOINTS.BASE_URL + API_ENDPOINTS.USERS.UPDATE_PROFILE, changedValues);
    }

    getUserProgress(username: string): Observable<UserProgressResponse>{
      return this.http.get<UserProgressResponse>(API_ENDPOINTS.USERS.PROGRESS(username));
    }
}
