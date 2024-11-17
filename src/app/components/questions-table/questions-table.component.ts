import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router, ActivatedRoute } from "@angular/router";

import { PaginatorState } from 'primeng/paginator';
import { ConfirmationService, MessageService } from "primeng/api";
import { debounceTime, Subject } from 'rxjs';

import { FilterOption, Question, QuestionsResponse } from '../../shared/types/question.types';
import { API_ENDPOINTS, MESSAGES } from '../../shared/constants';
import { QuestionService } from '../../services/question/question.service';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from "../../shared/config/roles.config";

@Component({
  selector: 'app-questions-table',
  templateUrl: './questions-table.component.html',
  styleUrls: ['./questions-table.component.scss']
})
export class QuestionsTableComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private questionService = inject(QuestionService);
  private pendingTopicFilter = signal<string | null>(null);
  private pendingCompanyFilter = signal<string | null>(null);
  private pendingDifficultyFilter = signal<string | null>(null);

  role = computed(() => this.authService.userRole());

  // Pagination signals
  currentPage = signal<number>(0);
  pageSize = signal<number>(15);
  first = signal<number>(0);
  totalRecords = signal<number>(0);

  // Data and filter signals
  questions = signal<Question[]>([]);
  searchQuery = signal<string>('');
  selectedCompany = signal<FilterOption | null>(null);
  selectedTopic = signal<FilterOption | null>(null);
  selectedDifficulty = signal<FilterOption | null>(null);

  // Filter options
  companies = signal<FilterOption[]>([]);
  topics = signal<FilterOption[]>([]);
  difficulties: FilterOption[] = [
    { name: 'Easy' },
    { name: 'Medium' },
    { name: 'Hard' }
  ];

  // Search debounce
  private searchSubject = new Subject<string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Set up search debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.first.set(0);
      this.loadQuestions();
      this.updateURL();
    });

    // Subscribe to query parameters first
    this.route.queryParams.subscribe(params => {
      if (params['topic']) {
        this.pendingTopicFilter.set(params['topic'].toLowerCase());
      }
      if (params['company']) {
        this.pendingCompanyFilter.set(params['company'].toLowerCase());
      }
      if (params['difficulty']) {
        this.pendingDifficultyFilter.set(params['difficulty'].toLowerCase());
      }
    });

    // Initial data load
    this.loadQuestions();
    this.loadFilterOptions();
  }

  private updateURL() {
    // Get current query params
    const currentParams = { ...this.route.snapshot.queryParams };

    // Update or remove topic param
    if (this.selectedTopic()) {
      currentParams['topic'] = this.selectedTopic()!.name.toLowerCase();
    } else {
      delete currentParams['topic'];
    }

    // Update or remove company param
    if (this.selectedCompany()) {
      currentParams['company'] = this.selectedCompany()!.name.toLowerCase();
    } else {
      delete currentParams['company'];
    }

    // Update or remove difficulty param
    if (this.selectedDifficulty()) {
      currentParams['difficulty'] = this.selectedDifficulty()!.name.toLowerCase();
    } else {
      delete currentParams['difficulty'];
    }

    // Navigate with updated params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      replaceUrl: true // Use replaceUrl to avoid building up browser history
    });
  }

  private buildParams(): HttpParams {
    let params = new HttpParams()
      .set('offset', this.first().toString())
      .set('limit', this.pageSize().toString());

    if (this.searchQuery()) {
      params = params.set('search', this.searchQuery());
    }

    if (this.selectedCompany()) {
      params = params.set('company', this.selectedCompany()!.name.toLowerCase());
    }

    if (this.selectedTopic()) {
      params = params.set('topic', this.selectedTopic()!.name.toLowerCase());
    }

    if (this.selectedDifficulty()) {
      params = params.set('difficulty', this.selectedDifficulty()!.name.toLowerCase());
    }

    return params;
  }

  loadQuestions() {
    const params = this.buildParams();
    this.questionService.getQuestions(API_ENDPOINTS.QUESTIONS.LIST, params).subscribe({
      next: (response: QuestionsResponse) => {
        // Sort questions by ID before setting them
        const sortedQuestions = [...response.questions].sort((a, b) =>
          parseInt(a.question_id) - parseInt(b.question_id)
        );
        this.questions.set(sortedQuestions);
        this.totalRecords.set(response.total);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: MESSAGES.ERROR.PROGRESS_FETCH_FAILED
        });
      }
    });
  }

  private applyPendingFilters(): void {
    // Apply topic filter if pending
    const pendingTopic = this.pendingTopicFilter();
    if (pendingTopic) {
      const topicName = this.capitalize(pendingTopic);
      const matchingTopic = this.topics().find(t => t.name === topicName);
      if (matchingTopic) {
        this.selectedTopic.set(matchingTopic);
        this.pendingTopicFilter.set(null);  // Clear the pending filter
      }
    }

    // Apply company filter if pending
    const pendingCompany = this.pendingCompanyFilter();
    if (pendingCompany) {
      const companyName = this.capitalize(pendingCompany);
      const matchingCompany = this.companies().find(c => c.name === companyName);
      if (matchingCompany) {
        this.selectedCompany.set(matchingCompany);
        this.pendingCompanyFilter.set(null);  // Clear the pending filter
      }
    }

    // Apply difficulty filter if pending
    const pendingDifficulty = this.pendingDifficultyFilter();
    if (pendingDifficulty) {
      const difficultyName = this.capitalize(pendingDifficulty);
      const matchingDifficulty = this.difficulties.find(d => d.name === difficultyName);
      if (matchingDifficulty) {
        this.selectedDifficulty.set(matchingDifficulty);
        this.pendingDifficultyFilter.set(null);  // Clear the pending filter
      }
    }

    // If any filters were applied, reload the questions
    if (pendingTopic || pendingCompany || pendingDifficulty) {
      this.first.set(0);  // Reset to first page
      this.loadQuestions();
      this.updateURL(); // Update URL after applying filters
    }
  }

  loadFilterOptions() {
    // Get all questions without pagination to build filter options
    this.questionService.getQuestions(API_ENDPOINTS.QUESTIONS.LIST).subscribe({
      next: (response) => {
        const uniqueCompanies = new Set<string>();
        const uniqueTopics = new Set<string>();

        response.questions.forEach(q => {
          q.company_tags.forEach(tag => uniqueCompanies.add(this.capitalize(tag)));
          q.topic_tags.forEach(tag => uniqueTopics.add(this.capitalize(tag)));
        });

        this.companies.set(Array.from(uniqueCompanies).map(name => ({ name })));
        this.topics.set(Array.from(uniqueTopics).map(name => ({ name })));

        // After filter options are loaded, apply any pending filters
        this.applyPendingFilters();
      }
    });
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.pageSize.set(event.rows);
    if (event.page !== undefined) this.currentPage.set(event.page);
    this.loadQuestions();
  }

  onSearchChange(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onCompanySelect(company: FilterOption | null) {
    this.selectedCompany.set(company);
    this.first.set(0);
    this.loadQuestions();
    this.updateURL();
  }

  onTopicSelect(topic: FilterOption | null) {
    this.selectedTopic.set(topic);
    this.first.set(0);
    this.loadQuestions();
    this.updateURL();
  }

  onDifficultySelect(difficulty: FilterOption | null) {
    this.selectedDifficulty.set(difficulty);
    this.first.set(0);
    this.loadQuestions();
    this.updateURL();
  }

  pickRandomQuestion() {
    const randomOffset = Math.floor(Math.random() * this.totalRecords());
    const params = this.buildParams().set('offset', randomOffset.toString()).set('limit', '1');

    this.questionService.getQuestions(API_ENDPOINTS.QUESTIONS.LIST, params).subscribe({
      next: (response) => {
        if (response.questions.length > 0) {
          this.redirectToQuestion(response.questions[0].question_link);
        }
      }
    });
  }

  onQuestionDelete(question: Question) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the question "${question.question_title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.questionService.deleteQuestion(question.question_id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: MESSAGES.SUCCESS.QUESTION_DELETE
            });
            this.loadQuestions();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: MESSAGES.ERROR.QUESTION_DELETE_FAILED
            });
          }
        });
      }
    });
  }

  redirectToQuestion(link: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  protected readonly Role = Role;
}
