import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from "../../shared/config/roles.config";
import { PaginatorState } from 'primeng/paginator';
import { ConfirmationService, MessageService } from "primeng/api";
import { debounceTime, Subject } from 'rxjs';

interface Question {
  question_id: string;
  question_title: string;
  difficulty: string;
  question_link: string;
  topic_tags: string[];
  company_tags: string[];
}

interface FilterOption {
  name: string;
}

interface QuestionsResponse {
  code: number;
  message: string;
  questions: Question[];
  total: number;
}

@Component({
  selector: 'app-questions-table',
  templateUrl: './questions-table.component.html',
  styleUrls: ['./questions-table.component.scss']
})
export class QuestionsTableComponent implements OnInit {
  public authService: AuthService = inject(AuthService);
  private http: HttpClient = inject(HttpClient);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

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

  ngOnInit() {
    // Set up search debounce
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.first.set(0);
      this.loadQuestions();
    });

    // Initial data load
    this.loadQuestions();
    this.loadFilterOptions();
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

    this.http.get<QuestionsResponse>('http://localhost:8080/questions', { params })
      .subscribe({
        next: (response) => {
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
            detail: 'Failed to fetch questions'
          });
        }
      });
  }

  loadFilterOptions() {
    // Get all questions without pagination to build filter options
    this.http.get<QuestionsResponse>('http://localhost:8080/questions').subscribe({
      next: (response) => {
        const uniqueCompanies = new Set<string>();
        const uniqueTopics = new Set<string>();

        response.questions.forEach(q => {
          q.company_tags.forEach(tag => uniqueCompanies.add(this.capitalize(tag)));
          q.topic_tags.forEach(tag => uniqueTopics.add(this.capitalize(tag)));
        });

        this.companies.set(Array.from(uniqueCompanies).map(name => ({ name })));
        this.topics.set(Array.from(uniqueTopics).map(name => ({ name })));
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
  }

  onTopicSelect(topic: FilterOption | null) {
    this.selectedTopic.set(topic);
    this.first.set(0);
    this.loadQuestions();
  }

  onDifficultySelect(difficulty: FilterOption | null) {
    this.selectedDifficulty.set(difficulty);
    this.first.set(0);
    this.loadQuestions();
  }

  pickRandomQuestion() {
    // Get a random offset within the total number of filtered results
    const randomOffset = Math.floor(Math.random() * this.totalRecords());
    const params = this.buildParams().set('offset', randomOffset.toString()).set('limit', '1');

    this.http.get<QuestionsResponse>('http://localhost:8080/questions', { params })
      .subscribe({
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
        this.http.delete(`http://localhost:8080/question?id=${question.question_id}`).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: 'Question deleted successfully'
            });
            this.loadQuestions(); // Reload current page
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete question'
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
