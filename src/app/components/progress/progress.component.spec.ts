import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProgressComponent } from './progress.component';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { MESSAGES } from '../../shared/constants';
import { UserProgressResponse } from '../../shared/types/user.types';
import { ErrorResponse} from "../../shared/types/platform.types";

describe('ProgressComponent', () => {
  let component: ProgressComponent;
  let fixture: ComponentFixture<ProgressComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authService: jasmine.SpyObj<AuthService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: Router;

  // Mock data
  const createMockProgressData = (modifications: Partial<UserProgressResponse> = {}): UserProgressResponse => ({
    code: 200,
    message: 'Success',
    leetcodeStats: {
      TotalQuestionsCount: 2000,
      TotalQuestionsDoneCount: 500,
      TotalEasyCount: 600,
      TotalMediumCount: 800,
      TotalHardCount: 600,
      EasyDoneCount: 200,
      MediumDoneCount: 200,
      HardDoneCount: 100,
      recent_ac_submission_title: ['Two Sum', 'Three Sum'],
      recent_ac_submission_ids: ['12345', '67890'],
      recent_ac_submissions_title_slugs: ['two-sum', 'three-sum']
    },
    codesageStats: {
      TotalQuestionsCount: 1000,
      TotalQuestionsDoneCount: 300,
      TotalEasyCount: 400,
      TotalMediumCount: 400,
      TotalHardCount: 200,
      EasyDoneCount: 150,
      MediumDoneCount: 100,
      HardDoneCount: 50,
      CompanyWiseStats: {
        'Google': 100,
        'Microsoft': 100,
        '': 0,
        ' ': 0
      },
      TopicWiseStats: {
        'Arrays': 150,
        'Strings': 150,
        '': 0,
        '  ': 0
      }
    },
    ...modifications
  });

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserProgress']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsernameFromToken']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [
        ProgressComponent
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    // userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router);
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
      userServiceSpy.getUserProgress.and.returnValue(of(createMockProgressData()));
      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
    });

    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading()).toBeFalse();
      expect(component.lcTotalQuestions()).toBe(0);
      expect(component.csTotalQuestions()).toBe(0);
      expect(component.recentSubmissions()).toEqual([]);
      expect(Object.keys(component.companyStats())).toEqual([]);
      expect(Object.keys(component.topicStats())).toEqual([]);
    });

    it('should redirect to login if no username is found', () => {
      const routerSpy = spyOn(router, 'navigate');
      authService.getUsernameFromToken.and.returnValue(undefined);

      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(routerSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Data Fetching and Error Handling', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
    });

    it('should handle successful progress fetch', fakeAsync(() => {
      const mockData = createMockProgressData();
      userServiceSpy.getUserProgress.and.returnValue(of(mockData));

      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.loading()).toBeFalse();
      expect(component.lcTotalQuestions()).toBe(2000);
      expect(component.lcTotalDone()).toBe(500);
      expect(component.lcTotalProgress()).toBe('500/2000');
      expect(component.recentSubmissions().length).toBe(2);
      expect(Object.keys(component.companyStats()).length).toBe(4);
      expect(Object.keys(component.topicStats()).length).toBe(4);
    }));

    it('should handle non-200 response code', fakeAsync(() => {
      const errorMockData = { ...createMockProgressData(), code: 400 };
      userServiceSpy.getUserProgress.and.returnValue(of(errorMockData));

      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.loading()).toBe(true);
      expect(component.lcTotalQuestions()).toBe(0);
      expect(component.csTotalQuestions()).toBe(0);
    }));

    it('should handle error when fetching progress', fakeAsync(() => {
      const errorResponse: ErrorResponse = {
        error_code: 500,
        message: 'Internal Server Error'
      };
      userServiceSpy.getUserProgress.and.returnValue(throwError(() => errorResponse));

      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'contrast',
        summary: 'Error',
        detail: MESSAGES.ERROR.PROGRESS_FETCH_FAILED
      });
    }));
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
      userServiceSpy.getUserProgress.and.returnValue(of(createMockProgressData()));
      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle refresh button click', fakeAsync(() => {
      userServiceSpy.getUserProgress.calls.reset();
      component.onRefresh();
      tick();

      expect(userServiceSpy.getUserProgress).toHaveBeenCalledWith('testuser');
    }));

    it('should redirect to login when username is not in token', fakeAsync(() => {
      authService.getUsernameFromToken.and.returnValue(undefined);
      spyOn(router, 'navigate');

      component.onRefresh();
      tick();

      expect(authService.getUsernameFromToken).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should navigate to questions with topic filter', () => {
      const routerSpy = spyOn(router, 'navigate');
      const topic = 'Arrays';

      component.onTopicClick(topic);

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { topic: topic.toLowerCase() } }
      );
    });

    it('should navigate to questions with company filter', () => {
      const routerSpy = spyOn(router, 'navigate');
      const company = 'Google';

      component.onCompanyClick(company);

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { company: company.toLowerCase() } }
      );
    });

    it('should redirect to LeetCode submission', () => {
      const windowSpy = spyOn(window, 'open');
      const submissionId = '12345';

      component.redirectToSubmission(submissionId);

      expect(windowSpy).toHaveBeenCalledWith(
        `https://leetcode.com/submissions/detail/${submissionId}`,
        '_blank'
      );
    });

    it('should not open window for empty submission ID', () => {
      const windowSpy = spyOn(window, 'open');

      component.redirectToSubmission('');

      expect(windowSpy).not.toHaveBeenCalled();
    });
  });

  describe('Progress Calculations', () => {
    beforeEach(() => {
      authService.getUsernameFromToken.and.returnValue('testuser');
    });

    it('should calculate progress strings correctly', fakeAsync(() => {
      const mockData = createMockProgressData();
      userServiceSpy.getUserProgress.and.returnValue(of(mockData));

      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.lcTotalProgress()).toBe('500/2000');
      expect(component.csTotalProgress()).toBe('300/1000');
    }));

    it('should handle recent submissions mapping', fakeAsync(() => {
      const mockData = createMockProgressData();
      userServiceSpy.getUserProgress.and.returnValue(of(mockData));

      fixture = TestBed.createComponent(ProgressComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      const submissions = component.recentSubmissions();
      expect(submissions.length).toBe(2);
      expect(submissions[0]).toEqual({ title: 'Two Sum', id: '12345' });
      expect(submissions[1]).toEqual({ title: 'Three Sum', id: '67890' });
    }));
  });
});
