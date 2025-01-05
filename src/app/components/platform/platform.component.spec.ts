import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PlatformComponent } from './platform.component';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { MessageService } from 'primeng/api';
import { UserService } from '../../services/user/user.service';
import { MESSAGES } from '../../shared/constants';
import { PlatformStatsResponse, ErrorResponse, PlatformStats } from '../../shared/types/platform.types';
import {ProgressSpinner} from "primeng/progressspinner";

describe('PlatformComponent', () => {
  let component: PlatformComponent;
  let fixture: ComponentFixture<PlatformComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: Router;

  // Mock data with different scenarios
  const createMockStats = (modifications: Partial<PlatformStats> = {}):
      PlatformStatsResponse => ({
    code: 200,
    message: 'Success',
    stats: {
      ActiveUserInLast24Hours: 100,
      TotalQuestionsCount: 500,
      DifficultyWiseQuestionsCount: {
        easy: 200,
        medium: 200,
        hard: 100
      },
      TopicWiseQuestionsCount: {
        'JavaScript': 100,
        'Python': 200,
        '': 0,
        '  ': 0  // Testing trimmed empty string
      },
      CompanyWiseQuestionsCount: {
        'Google': 150,
        'Microsoft': 150,
        '': 0,
        ' ': 0   // Testing whitespace string
      },
      ...modifications
    }
  });

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['fetchPlatformStats']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      declarations: [
        PlatformComponent,
        AppHeaderComponent,
        ProgressSpinner
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    }).compileComponents();

    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router);
  });

  describe('Component Initialization', () => {
    beforeEach(() => {
      userService.fetchPlatformStats.and.returnValue(of(createMockStats()));
      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
    });

    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should initialize with default values before data fetch', () => {
      // Test initial values before detectChanges
      expect(component.loading()).toBeFalse();
      expect(component.activeUsers()).toBe(0);
      expect(component.totalQuestions()).toBe(0);
      expect(component.easyQuestions()).toBe(0);
      expect(component.mediumQuestions()).toBe(0);
      expect(component.hardQuestions()).toBe(0);
      expect(Object.keys(component.companyStats()).length).toBe(0);
      expect(Object.keys(component.topicStats()).length).toBe(0);
    });

    it('should render app header', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const header = compiled.querySelector('app-header');
      expect(header).toBeTruthy();
    });
  });

  describe('Data Fetching and Error Handling', () => {
    it('should handle successful platform stats fetch with complete data', fakeAsync(() => {
      const mockData = createMockStats();
      userService.fetchPlatformStats.and.returnValue(of(mockData));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.loading()).toBeFalse();
      expect(component.activeUsers()).toBe(100);
      expect(component.totalQuestions()).toBe(500);
      expect(component.easyQuestions()).toBe(200);
      expect(component.mediumQuestions()).toBe(200);
      expect(component.hardQuestions()).toBe(100);
      expect(Object.keys(component.companyStats()).length).toBe(2); // Only non-empty keys
      expect(Object.keys(component.topicStats()).length).toBe(2); // Only non-empty keys
    }));

    it('should handle platform stats fetch with partial data', fakeAsync(() => {
      const partialMockData = createMockStats({
        ActiveUserInLast24Hours: 0,
        TopicWiseQuestionsCount: {},
        CompanyWiseQuestionsCount: {}
      });
      userService.fetchPlatformStats.and.returnValue(of(partialMockData));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.activeUsers()).toBe(0);
      expect(Object.keys(component.companyStats()).length).toBe(0);
      expect(Object.keys(component.topicStats()).length).toBe(0);
    }));

    it('should handle non-200 response code', fakeAsync(() => {
      const errorMockData = { ...createMockStats(), code: 400 };
      userService.fetchPlatformStats.and.returnValue(of(errorMockData));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(component.loading()).toBeTrue();
      expect(component.activeUsers()).toBe(0); // Should retain initial values
    }));

    it('should handle error when fetching platform stats', fakeAsync(() => {
      const errorResponse: ErrorResponse = {
        error_code: 500,
        message: 'Internal Server Error'
      };
      userService.fetchPlatformStats.and.returnValue(throwError(() => errorResponse));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: MESSAGES.ERROR.PLATFORM_FETCH_FAILED
      });
      expect(component.loading()).toBeFalse();
    }));

    it('should handle network error when fetching platform stats', fakeAsync(() => {
      userService.fetchPlatformStats.and.returnValue(throwError(() => new Error('Network Error')));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: MESSAGES.ERROR.PLATFORM_FETCH_FAILED
      });
      expect(component.loading()).toBeFalse();
    }));
  });

  describe('User Interactions', () => {
    beforeEach(() => {
      userService.fetchPlatformStats.and.returnValue(of(createMockStats()));
      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should handle refresh button click', fakeAsync(() => {
      userService.fetchPlatformStats.calls.reset();
      component.onRefresh();
      tick();

      expect(component.loading()).toBeFalse();
      expect(userService.fetchPlatformStats).toHaveBeenCalledTimes(1);
    }));

    it('should navigate to questions with topic filter when topic is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const topic = 'JavaScript';

      component.onTopicClick(topic);

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { topic: topic.toLowerCase() } }
      );
    });

    it('should navigate to questions with company filter when company is clicked', () => {
      const routerSpy = spyOn(router, 'navigate');
      const company = 'Google';

      component.onCompanyClick(company);

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { company: company.toLowerCase() } }
      );
    });

    it('should handle topic click with special characters', () => {
      const routerSpy = spyOn(router, 'navigate');
      const topic = 'C++';

      component.onTopicClick(topic);

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { topic: topic.toLowerCase() } }
      );
    });

    it('should handle company click with special characters', () => {
      const routerSpy = spyOn(router, 'navigate');
      const company = 'Meta/Facebook';

      component.onCompanyClick(company);

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { company: company.toLowerCase() } }
      );
    });
  });

  describe('Data Filtering', () => {
    it('should properly filter empty keys from stats', fakeAsync(() => {
      const mockData = createMockStats({
        TopicWiseQuestionsCount: {
          'JavaScript': 100,
          '': 0,
          ' ': 0,
          '  ': 0
        },
        CompanyWiseQuestionsCount: {
          'Google': 150,
          '': 0,
          ' ': 0,
          '    ': 0
        }
      });
      userService.fetchPlatformStats.and.returnValue(of(mockData));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(Object.keys(component.companyStats()).length).toBe(1);
      expect(Object.keys(component.topicStats()).length).toBe(1);
      expect(Object.keys(component.companyStats())).toContain('Google');
      expect(Object.keys(component.topicStats())).toContain('JavaScript');
    }));

    it('should handle empty stats objects', fakeAsync(() => {
      const mockData = createMockStats({
        TopicWiseQuestionsCount: {},
        CompanyWiseQuestionsCount: {}
      });
      userService.fetchPlatformStats.and.returnValue(of(mockData));

      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(Object.keys(component.companyStats()).length).toBe(0);
      expect(Object.keys(component.topicStats()).length).toBe(0);
    }));
  });


  describe('Template Rendering', () => {
    beforeEach(() => {
      userService.fetchPlatformStats.and.returnValue(of(createMockStats()));
      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should display platform stats correctly', () => {
      const compiled = fixture.nativeElement;

      // Check stats values
      expect(compiled.querySelector('.stat-value').textContent).toContain('100'); // Active users
      expect(compiled.querySelectorAll('.stat-value')[1].textContent).toContain('500'); // Total questions
      expect(compiled.querySelectorAll('.stat-value')[2].textContent).toContain('200'); // Easy questions
      expect(compiled.querySelectorAll('.stat-value')[3].textContent).toContain('200'); // Medium questions
      expect(compiled.querySelectorAll('.stat-value')[4].textContent).toContain('100'); // Hard questions
    });

    it('should display topic tags correctly', () => {
      const compiled = fixture.nativeElement;
      const topicTags = compiled.querySelectorAll('.topic-tag-card');

      expect(topicTags.length).toBe(2); // JavaScript and Python
      expect(topicTags[0].textContent).toContain('JavaScript');
      expect(topicTags[0].textContent).toContain('x100');
    });

    it('should display company tags correctly', () => {
      const compiled = fixture.nativeElement;
      const companyTags = compiled.querySelectorAll('.company-tag-card');

      expect(companyTags.length).toBe(2); // Google and Microsoft
      expect(companyTags[0].textContent).toContain('Google');
      expect(companyTags[0].textContent).toContain('x150');
    });

    it('should display "No data found" when topic stats are empty', fakeAsync(() => {
      const emptyMockData = createMockStats({ TopicWiseQuestionsCount: {} });
      userService.fetchPlatformStats.and.returnValue(of(emptyMockData));

      component.fetchPlatformStats();
      tick();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const noDataMessage = compiled.querySelector('.no-topic-tags');
      expect(noDataMessage.textContent.trim()).toBe('No data found');
    }));

    it('should display "No data found" when company stats are empty', fakeAsync(() => {
      const emptyMockData = createMockStats({ CompanyWiseQuestionsCount: {} });
      userService.fetchPlatformStats.and.returnValue(of(emptyMockData));

      component.fetchPlatformStats();
      tick();
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      const noDataMessage = compiled.querySelector('.no-company-tags');
      expect(noDataMessage.textContent.trim()).toBe('No data found');
    }));

    it('should handle refresh button click', fakeAsync(() => {
      const compiled = fixture.nativeElement;
      const refreshButton = compiled.querySelector('button[aria-label="Refresh"]');

      userService.fetchPlatformStats.calls.reset();
      refreshButton.click();
      tick();

      expect(userService.fetchPlatformStats).toHaveBeenCalled();
    }));
  });

  describe('Public Methods Testing', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
    });

    it('should filter empty keys correctly', () => {
      const testStats = {
        'validKey': 100,
        '': 0,
        ' ': 0,
        '  ': 0,
        'anotherValid': 200
      };

      const filtered = component.filterEmptyKeys(testStats);

      expect(Object.keys(filtered).length).toBe(2);
      expect(filtered['validKey']).toBe(100);
      expect(filtered['anotherValid']).toBe(200);
      expect(filtered['']).toBeUndefined();
      expect(filtered[' ']).toBeUndefined();
      expect(filtered['  ']).toBeUndefined();
    });

    it('should handle empty object in filterEmptyKeys', () => {
      const filtered = component.filterEmptyKeys({});
      expect(Object.keys(filtered).length).toBe(0);
    });

    it('should handle object with only empty keys in filterEmptyKeys', () => {
      const testStats = {
        '': 0,
        ' ': 0,
        '  ': 0
      };

      const filtered = component.filterEmptyKeys(testStats);
      expect(Object.keys(filtered).length).toBe(0);
    });

    it('should fetch platform stats and update signals', fakeAsync(() => {
      const mockData = createMockStats();
      userService.fetchPlatformStats.and.returnValue(of(mockData));

      component.fetchPlatformStats();
      tick();

      expect(component.activeUsers()).toBe(100);
      expect(component.totalQuestions()).toBe(500);
      expect(component.easyQuestions()).toBe(200);
      expect(component.mediumQuestions()).toBe(200);
      expect(component.hardQuestions()).toBe(100);
      expect(Object.keys(component.companyStats()).length).toBe(2);
      expect(Object.keys(component.topicStats()).length).toBe(2);
    }));

    it('should handle striped background class for odd indexed items', () => {
      const compiled = fixture.nativeElement;
      const topicCards = compiled.querySelectorAll('.topic-tag-card-text');
      const companyCards = compiled.querySelectorAll('.company-tag-card-text');

      if (topicCards.length > 1) {
        expect(topicCards[1].classList.contains('striped-background')).toBeTrue();
      }

      if (companyCards.length > 1) {
        expect(companyCards[1].classList.contains('striped-background')).toBeTrue();
      }
    });
  });

  describe('Navigation with Template Interaction', () => {
    beforeEach(() => {
      userService.fetchPlatformStats.and.returnValue(of(createMockStats()));
      fixture = TestBed.createComponent(PlatformComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should navigate when clicking on topic tag', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');
      const compiled = fixture.nativeElement;
      const topicTag = compiled.querySelector('.topic-tag-card-text');

      topicTag.click();
      tick();

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { topic: 'javascript' } }
      );
    }));

    it('should navigate when clicking on company tag', fakeAsync(() => {
      const routerSpy = spyOn(router, 'navigate');
      const compiled = fixture.nativeElement;
      const companyTag = compiled.querySelector('.company-tag-card-text');

      companyTag.click();
      tick();

      expect(routerSpy).toHaveBeenCalledWith(
        ['/questions'],
        { queryParams: { company: 'google' } }
      );
    }));
  });
});
