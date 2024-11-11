import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth/auth.service';
import { Role } from "../../shared/config/roles.config";
import { PaginatorState } from 'primeng/paginator';
import {ConfirmationService, MessageService} from "primeng/api";

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

  currentPage = signal<number>(0);
  pageSize = signal<number>(15);
  first = signal<number>(0);

  questions = signal<Question[]>([]);
  searchQuery = signal<string>('');

  selectedCompany = signal<FilterOption | null>(null);
  selectedTopic = signal<FilterOption | null>(null);
  selectedDifficulty = signal<FilterOption | null>(null);

  companies = signal<FilterOption[]>([]);
  topics = signal<FilterOption[]>([]);
  difficulties: FilterOption[] = [
    { name: 'Easy' },
    { name: 'Medium' },
    { name: 'Hard' }
  ];

  filteredQuestions = computed(() => {
    let filtered = this.questions();
    const search = this.searchQuery().toLowerCase();
    const company = this.selectedCompany()?.name.toLowerCase();
    const topic = this.selectedTopic()?.name.toLowerCase();
    const difficulty = this.selectedDifficulty()?.name;

    if (search) {
      filtered = filtered.filter(q =>
        q.question_title.toLowerCase().includes(search.toLowerCase()) ||
        q.question_id.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (company) {
      filtered = filtered.filter(q =>
        q.company_tags.some(tag => tag.toLowerCase() === company)
      );
    }

    if (topic) {
      filtered = filtered.filter(q =>
        q.topic_tags.some(tag => tag.toLowerCase() === topic)
      );
    }

    if (difficulty) {
      filtered = filtered.filter(q =>
        q.difficulty === difficulty.toLowerCase()
      );
    }

    return filtered;
  });

  paginatedQuestions = computed(() => {
    const filtered = this.filteredQuestions();
    const startIndex = this.first();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  totalRecords = computed(() => this.filteredQuestions().length);

  ngOnInit() {
    this.fetchQuestions();
  }

  fetchQuestions() {
    this.http.get<any>('http://localhost:8080/questions').subscribe((response: { questions: Question[]; }) => {
      this.questions.set(response.questions);

      const uniqueCompanies = new Set<string>();
      const uniqueTopics = new Set<string>();

      this.questions().forEach(q => {
        q.company_tags.forEach(tag => uniqueCompanies.add(this.capitalize(tag)));
        q.topic_tags.forEach(tag => uniqueTopics.add(this.capitalize(tag)));
      });

      this.companies.set(Array.from(uniqueCompanies).map(name => ({ name })));
      this.topics.set(Array.from(uniqueTopics).map(name => ({ name })));
    });
  }

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.pageSize.set(event.rows);
    if (event.page !== undefined) this.currentPage.set(event.page);
  }

  pickRandomQuestion() {
    const questions = this.filteredQuestions();
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      const randomQuestion = questions[randomIndex];
      this.redirectToQuestion(randomQuestion.question_link);
    }
  }

  onCompanySelect(company: FilterOption | null) {
    this.selectedCompany.set(company);
    this.first.set(0);
  }

  onTopicSelect(topic: FilterOption | null) {
    this.selectedTopic.set(topic);
    this.first.set(0);
  }

  onDifficultySelect(difficulty: FilterOption | null) {
    this.selectedDifficulty.set(difficulty);
    this.first.set(0);
  }

  onQuestionDelete(question: Question) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the question "${question.question_title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptIcon: 'none',
     rejectIcon: 'none',
      accept: () => {
        const currentQuestions = this.questions();
        const updatedQuestions = currentQuestions.filter(q => q.question_id !== question.question_id);
        this.questions.set(updatedQuestions);

        this.http.delete(`http://localhost:8080/question?id=${question.question_id}`).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: 'Question deleted successfully'
            });
          },
          error: (error) => {
            this.questions.set(currentQuestions);
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
