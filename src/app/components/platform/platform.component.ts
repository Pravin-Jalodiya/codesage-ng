import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MessageService } from 'primeng/api';

import { UserService } from '../../services/user/user.service';
import { MESSAGES } from '../../shared/constants';

@Component({
  selector: 'app-progress',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent implements OnInit {
  messageService: MessageService = inject(MessageService);
  userService: UserService = inject(UserService);

  loading = signal<boolean>(false);

  // Platform stats
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
    this.loading.set(true);

    this.userService.fetchPlatformStats().subscribe({
      next: (response) => {
        if (response.code === 200) {
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: MESSAGES.ERROR.PLATFORM_FETCH_FAILED
        });
        this.loading.set(false);
      }
    });
  }

  ngOnInit(): void {}

  onRefresh(): void {
    this.fetchPlatformStats();
  }

  protected readonly Object = Object;
}
