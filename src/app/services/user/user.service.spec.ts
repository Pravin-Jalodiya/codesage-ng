import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

import { UserService } from './user.service';
import { API_ENDPOINTS, PLATFORM_PATHS } from '../../shared/constants';
import {
  UsersListResponse,
  UserBanToggleResponse,
  UserProgressResponse,
} from '../../shared/types/user.types';
import { NoBodyResponse } from '../../shared/types/question.types';
import {PlatformStatsResponse} from "../../shared/types/platform.types";
import {UpdateProfileResponse, UserProfile, UserProfileResponse} from "../../shared/types/profile.types";

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    // Create spy objects for dependencies
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUsers', () => {
    it('should fetch users list', () => {
      const mockUsersResponse: UsersListResponse = {
        code: 200,
        message: 'Users retrieved successfully',
        total: 2,
        users: [
          {
            role: 'user',
            username: 'testuser1',
            name: 'Test User 1',
            email: 'test1@example.com',
            organisation: 'Org1',
            country: 'USA',
            is_banned: false,
            leetcode_id: 'leetcode1',
            last_seen: new Date()
          },
          {
            role: 'admin',
            username: 'testuser2',
            name: 'Test User 2',
            email: 'test2@example.com',
            organisation: 'Org2',
            country: 'Canada',
            is_banned: true,
            leetcode_id: 'leetcode2',
            last_seen: new Date()
          }
        ]
      };

      service.getUsers().subscribe(response => {
        expect(response).toEqual(mockUsersResponse);
        expect(response.users.length).toBe(2);
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USERS.LIST}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockUsersResponse);
    });
  });

  describe('toggleUserBanState', () => {
    it('should toggle user ban state', () => {
      const username = 'testuser';
      const mockResponse: UserBanToggleResponse = {
        code: 200,
        message: 'User ban state toggled successfully'
      };

      service.toggleUserBanState(username, {}).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.USERS.BAN(username));
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush(mockResponse);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', () => {
      const username = 'testuser';
      const mockResponse: NoBodyResponse = {
        code: 200,
        message: 'User deleted successfully'
      };

      service.deleteUser(username).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.USERS.DELETE(username));
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('fetchPlatformStats', () => {
    it('should fetch platform statistics', () => {
      const mockStatsResponse: PlatformStatsResponse = {
        code: 200,
        message: 'Platform stats retrieved successfully',
        stats: {
          ActiveUserInLast24Hours: 100,
          TotalQuestionsCount: 500,
          DifficultyWiseQuestionsCount: {
            easy: 200,
            medium: 250,
            hard: 50
          },
          TopicWiseQuestionsCount: {
            'Array': 100,
            'String': 50
          },
          CompanyWiseQuestionsCount: {
            'Google': 30,
            'Amazon': 25
          }
        }
      };

      service.fetchPlatformStats().subscribe(response => {
        expect(response).toEqual(mockStatsResponse);
      });

      const req = httpMock.expectOne(PLATFORM_PATHS.PLATFORM_STATS);
      expect(req.request.method).toBe('GET');
      req.flush(mockStatsResponse);
    });
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile', () => {
      const username = 'testuser';
      const mockProfileResponse: UserProfileResponse = {
        code: 200,
        message: 'User profile retrieved successfully',
        user_profile: {
          username: 'testuser',
          name: 'Test User',
          email: 'test@example.com',
          leetcodeId: 'leetcode_test',
          organisation: 'Test Org',
          country: 'Test Country'
        }
      };

      service.fetchUserProfile(username).subscribe(response => {
        expect(response).toEqual(mockProfileResponse);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.USERS.PROFILE(username));
      expect(req.request.method).toBe('GET');
      req.flush(mockProfileResponse);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile', () => {
      const updatedProfile: Partial<UserProfile> = {
        name: 'Updated Name',
        organisation: 'New Org'
      };

      const mockUpdateResponse: UpdateProfileResponse = {
        code: 200,
        message: 'User profile updated successfully'
      };

      service.updateUserProfile(updatedProfile).subscribe(response => {
        expect(response).toEqual(mockUpdateResponse);
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.USERS.UPDATE_PROFILE}`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(updatedProfile);
      req.flush(mockUpdateResponse);
    });
  });

  describe('getUserProgress', () => {
    it('should fetch user progress', () => {
      const username = 'testuser';
      const mockProgressResponse: UserProgressResponse = {
        code: 200,
        message: 'User progress retrieved successfully',
        leetcodeStats: {
          TotalQuestionsCount: 100,
          TotalQuestionsDoneCount: 50,
          TotalEasyCount: 40,
          TotalMediumCount: 50,
          TotalHardCount: 10,
          EasyDoneCount: 20,
          MediumDoneCount: 25,
          HardDoneCount: 5,
          recent_ac_submission_title: ['Two Sum', 'Valid Parentheses'],
          recent_ac_submissions_title_slugs: ['two-sum', 'valid-parentheses'],
          recent_ac_submission_ids: ['1', '2']
        },
        codesageStats: {
          TotalQuestionsCount: 200,
          TotalQuestionsDoneCount: 100,
          TotalEasyCount: 80,
          TotalMediumCount: 100,
          TotalHardCount: 20,
          EasyDoneCount: 40,
          MediumDoneCount: 50,
          HardDoneCount: 10,
          CompanyWiseStats: {
            'Google': 25,
            'Amazon': 20
          },
          TopicWiseStats: {
            'Array': 50,
            'String': 30
          }
        }
      };

      service.getUserProgress(username).subscribe(response => {
        expect(response).toEqual(mockProgressResponse);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.USERS.PROGRESS(username));
      expect(req.request.method).toBe('GET');
      req.flush(mockProgressResponse);
    });
  });
});
