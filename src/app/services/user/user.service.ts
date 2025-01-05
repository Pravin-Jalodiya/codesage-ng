import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

import { API_ENDPOINTS, DEFAULTS, PLATFORM_PATHS } from '../../shared/constants';
import { PlatformStatsResponse } from '../../shared/types/platform.types';
import { UpdateProfileResponse, UserProfile, UserProfileResponse } from '../../shared/types/profile.types';
import { NoBodyResponse } from '../../shared/types/question.types';
import { UserBanToggleResponse, UserProgressListResponse, UserProgressResponse, UsersListResponse } from '../../shared/types/user.types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor( private http: HttpClient,
    private messageService: MessageService,
    private router: Router) {
    console.log('UserService called')
  }

  userAvatar: WritableSignal<string> = signal(DEFAULTS.USER.AVATAR);

  getUsers(params?: HttpParams): Observable<UsersListResponse>{
    return this.http.get<UsersListResponse>(API_ENDPOINTS.BASE_URL + API_ENDPOINTS.USERS.LIST, { params })
  }

    toggleUserBanState(username: string): Observable<UserBanToggleResponse>{
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

    getUserProgressList(): Observable<UserProgressListResponse> {
      return this.http.get<UserProgressListResponse>(`${API_ENDPOINTS.USERS.PROGRESS_LIST()}`);
    }
}
