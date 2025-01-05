import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionsTableComponent } from './questions-table.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { QuestionService } from '../../services/question/question.service';
import { AuthService } from '../../services/auth/auth.service';
import {Confirmation, ConfirmationService, MessageService} from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Role } from '../../shared/config/roles.config';
import { QuestionsResponse, Question } from '../../shared/types/question.types';
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {PaginatorModule} from "primeng/paginator";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";

describe('QuestionsTableComponent', () => {
  let component: QuestionsTableComponent;
  let fixture: ComponentFixture<QuestionsTableComponent>;
  let questionServiceSpy: jasmine.SpyObj<QuestionService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockQuestions: Question[] = [
    {
      question_id: '1',
      question_title: 'Test Question 1',
      difficulty: 'Easy',
      question_link: 'https://example.com/q1',
      topic_tags: ['Array'],
      company_tags: ['Google']
    },
    {
      question_id: '2',
      question_title: 'Test Question 2',
      difficulty: 'Medium',
      question_link: 'https://example.com/q2',
      topic_tags: ['String'],
      company_tags: ['Amazon']
    }
  ];

  const mockQuestionsResponse: QuestionsResponse = {
    code: 200,
    message: 'Success',
    questions: mockQuestions,
    total: 2
  };

  beforeEach(async () => {
    const questionServiceSpyObj = jasmine.createSpyObj('QuestionService', ['getQuestions', 'deleteQuestion']);
    const authServiceSpyObj = jasmine.createSpyObj('AuthService', [], {
      userRole: jasmine.createSpy('userRole').and.returnValue(Role.ADMIN)
    });
    const confirmationServiceSpyObj = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    const messageServiceSpyObj = jasmine.createSpyObj('MessageService', ['add']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        DropdownModule,
        InputTextModule,
        PaginatorModule,
        BrowserAnimationsModule
      ],
      declarations: [ QuestionsTableComponent ],
      providers: [
        { provide: QuestionService, useValue: questionServiceSpyObj },
        {
          provide: AuthService,
          useValue: {
            userRole: () => Role.ADMIN
          }
        },
        { provide: ConfirmationService, useValue: confirmationServiceSpyObj },
        { provide: MessageService, useValue: messageServiceSpyObj },
        { provide: Router, useValue: routerSpyObj },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
            snapshot: { queryParams: {} }
          }
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(QuestionsTableComponent);
    component = fixture.componentInstance;

    questionServiceSpy = TestBed.inject(QuestionService) as jasmine.SpyObj<QuestionService>;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    confirmationServiceSpy = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup mock for getQuestions to return mock data for both initial load and filter options
    questionServiceSpy.getQuestions.and.returnValue(of({
      ...mockQuestionsResponse,
      questions: [
        ...mockQuestions,
        {
          question_id: '3',
          question_title: 'Test Question 3',
          difficulty: 'Hard',
          question_link: 'https://example.com/q3',
          topic_tags: ['Dynamic Programming', 'Graph'],
          company_tags: ['Microsoft', 'Facebook']
        }
      ],
      total: 3
    }));
  });

  it('should create', () => {
    fixture.detectChanges(); // Trigger initial data binding
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load questions and filter options on initialization', () => {
      fixture.detectChanges(); // Triggers ngOnInit

      // Verify questions are loaded
      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
      expect(component.questions().length).toBeGreaterThan(0);
      expect(component.totalRecords()).toBeGreaterThan(0);

      // Verify filter options are populated
      expect(component.companies().length).toBeGreaterThan(0);
      expect(component.topics().length).toBeGreaterThan(0);
    });
  });

  describe('loadQuestions', () => {
    it('should sort questions by question_id', () => {
      const unsortedQuestions = [
        { ...mockQuestions[1], question_id: '10' },
        { ...mockQuestions[0], question_id: '2' }
      ];

      questionServiceSpy.getQuestions.and.returnValue(of({
        ...mockQuestionsResponse,
        questions: unsortedQuestions
      }));

      fixture.detectChanges();

      expect(component.questions()[0].question_id).toBe('2');
    });

    it('should handle error when loading questions', () => {
      questionServiceSpy.getQuestions.and.returnValue(throwError(() => new Error('Error')));

      fixture.detectChanges();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: jasmine.any(String)
      });
    });
  });

  describe('onPageChange', () => {
    it('should update pagination and load questions', () => {
      const event = {
        first: 15,
        rows: 20,
        page: 1
      };

      component.onPageChange(event);

      expect(component.first()).toBe(15);
      expect(component.pageSize()).toBe(20);
      expect(component.currentPage()).toBe(1);
      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });
  });

  describe('onQuestionDelete', () => {
    it('should call confirmation service when deleting a question', () => {
      const questionToDelete = mockQuestions[0];

      confirmationServiceSpy.confirm.and.callFake((confirmation: Confirmation) => {
        if (confirmation.accept) {
          confirmation.accept();
        }
        return confirmationServiceSpy;
      });

      questionServiceSpy.deleteQuestion.and.returnValue(of({code: 200, message: "Question deleted successfully"}));

      component.onQuestionDelete(questionToDelete);

      expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
      expect(questionServiceSpy.deleteQuestion).toHaveBeenCalledWith(questionToDelete.question_id);
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Success',
        detail: jasmine.any(String)
      });
      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      const questionToDelete = mockQuestions[0];

      confirmationServiceSpy.confirm.and.callFake((confirmation: Confirmation) => {
        if (confirmation.accept) {
          confirmation.accept();
        }
        return confirmationServiceSpy;
      });

      questionServiceSpy.deleteQuestion.and.returnValue(throwError(() => new Error('Delete failed')));

      component.onQuestionDelete(questionToDelete);

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: jasmine.any(String)
      });
    });
  });

  describe('pickRandomQuestion', () => {
    it('should select and redirect to a random question', () => {
      spyOn(component, 'redirectToQuestion');
      component.totalRecords.set(10);

      component.pickRandomQuestion();

      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
      expect(component.redirectToQuestion).toHaveBeenCalledWith(mockQuestions[0].question_link);
    });
  });

  describe('Filter Methods', () => {
    it('should handle company filter selection', () => {
      const companyFilter = { name: 'Google' };

      component.onCompanySelect(companyFilter);

      expect(component.selectedCompany()).toBe(companyFilter);
      expect(component.first()).toBe(0);
      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });

    it('should handle topic filter selection', () => {
      const topicFilter = { name: 'Array' };

      component.onTopicSelect(topicFilter);

      expect(component.selectedTopic()).toBe(topicFilter);
      expect(component.first()).toBe(0);
      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });

    it('should handle difficulty filter selection', () => {
      const difficultyFilter = { name: 'Easy' };

      component.onDifficultySelect(difficultyFilter);

      expect(component.selectedDifficulty()).toBe(difficultyFilter);
      expect(component.first()).toBe(0);
      expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    });
  });

  it('should redirect to question link when redirectToQuestion is called', () => {
    spyOn(window, 'open');
    const questionLink = 'https://example.com/question';
    component.redirectToQuestion(questionLink);
    expect(window.open).toHaveBeenCalledWith(questionLink, '_blank');
  });

  it('should call the question service to fetch a random question in pickRandomQuestion', () => {
    const mockResponse: QuestionsResponse = {
      questions: [{ question_id: '1', question_link: 'https://example.com/question' } as Question],
      total: 1,
      code: 200,
      message: "fetched questions successfully"
    };
    questionServiceSpy.getQuestions.and.returnValue(of(mockResponse));
    spyOn(component, 'redirectToQuestion');
    component.totalRecords.set(10);

    component.pickRandomQuestion();

    expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    expect(component.redirectToQuestion).toHaveBeenCalledWith('https://example.com/question');
  });

  it('should add a success message and reload questions when a question is deleted successfully', () => {
    const mockQuestion: Question = { question_id: '1' } as Question;
    questionServiceSpy.deleteQuestion.and.returnValue(of({code: 200, message: "question deleted successfully"}));
    spyOn(component, 'loadQuestions');

    confirmationServiceSpy.confirm.and.callFake((confirmation: Confirmation) => {
      if (confirmation.accept) {
        confirmation.accept();
      }
      return confirmationServiceSpy;
    });

    component.onQuestionDelete(mockQuestion);

    expect(questionServiceSpy.deleteQuestion).toHaveBeenCalledWith(mockQuestion.question_id);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Success',
      detail: jasmine.any(String),
    });
    expect(component.loadQuestions).toHaveBeenCalled();
  });

  it('should add an error message when question deletion fails', () => {
    const mockQuestion: Question = { question_id: '1' } as Question;
    questionServiceSpy.deleteQuestion.and.returnValue(throwError(() => new Error('Error')));
    confirmationServiceSpy.confirm.and.callFake((confirmation: Confirmation) => {
      if (confirmation.accept) {
        confirmation.accept();
      }
      return confirmationServiceSpy;
    });

    component.onQuestionDelete(mockQuestion);

    expect(questionServiceSpy.deleteQuestion).toHaveBeenCalledWith(mockQuestion.question_id);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: jasmine.any(String),
    });
  });

  it('should load filter options and apply pending filters', () => {
    const mockResponse: QuestionsResponse = {
      questions: [
        {
          question_id: '1',
          company_tags: ['google', 'microsoft'],
          topic_tags: ['array', 'dynamic programming'],
        } as Question,
      ],
      total: 1,
      code: 200,
      message: "fetched questions successfully"
    };

    questionServiceSpy.getQuestions.and.returnValue(of(mockResponse));
    spyOn(component, 'applyPendingFilters');

    component.loadFilterOptions();

    expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
    expect(component.companies().length).toBe(2);
    expect(component.topics().length).toBe(2);
    expect(component.applyPendingFilters).toHaveBeenCalled();
  });
});
