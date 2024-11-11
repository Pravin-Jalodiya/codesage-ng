import {Component, inject, signal, OnInit} from '@angular/core';
import { AuthService } from "../../services/auth/auth.service";
import { HttpClient } from '@angular/common/http';
import {MessageService} from "primeng/api";
import {Router} from "@angular/router";

interface PlatformStatsResponse {
  code: number;
  message: string;
  stats: {
    ActiveUserInLast24Hours: number;
    TotalQuestionsCount: number;
    DifficultyWiseQuestionsCount: {
      easy: number;
      medium: number;
      hard: number;
    };
    TopicWiseQuestionsCount: Record<string, number>;
    CompanyWiseQuestionsCount: Record<string, number>;
  };
}

@Component({
  selector: 'app-progress',
  templateUrl: './platform.component.html',
  styleUrl: './platform.component.scss'
})

export class PlatformComponent implements OnInit {
  private http = inject(HttpClient);
  private messageService: MessageService = inject(MessageService);
  private readonly baseUrl = 'http://localhost:8080';

  loading = signal<boolean>(false);

  // Platform Stats
  activeUsers = signal<number>(0);
  totalQuestions = signal<number>(0);
  easyQuestions = signal<number>(0);
  mediumQuestions = signal<number>(0);
  hardQuestions = signal<number>(0);
  companyStats = signal<Record<string, number>>({});
  topicStats = signal<Record<string, number>>({});

  constructor(private router: Router) {
    this.fetchPlatformStats();
  }

  private filterEmptyKeys(stats: Record<string, number>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(stats).filter(([key]) => key.trim() !== '')
    );
  }

  private fetchPlatformStats(): void {
    const url = `${this.baseUrl}/platform-stats`;

    this.http.get<PlatformStatsResponse>(url).subscribe({
      next: (response) => {
        if(response.code === 200) {
          this.loading.set(false);

          // Update platform stats
          this.activeUsers.set(response.stats.ActiveUserInLast24Hours);
          this.totalQuestions.set(response.stats.TotalQuestionsCount);
          this.easyQuestions.set(response.stats.DifficultyWiseQuestionsCount.easy);
          this.mediumQuestions.set(response.stats.DifficultyWiseQuestionsCount.medium);
          this.hardQuestions.set(response.stats.DifficultyWiseQuestionsCount.hard);

          // Filter out empty keys before setting stats
          this.companyStats.set(this.filterEmptyKeys(response.stats.CompanyWiseQuestionsCount));
          this.topicStats.set(this.filterEmptyKeys(response.stats.TopicWiseQuestionsCount));
        }
      },
      error: (error) => {
        console.error('Error fetching platform stats:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch platform statistics'
        });
      }
    });
  }

  protected readonly Object = Object;

  ngOnInit(): void {
    this.loading.set(true);
  }
}
