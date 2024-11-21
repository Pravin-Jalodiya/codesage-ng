import {Component, OnInit, inject, signal, WritableSignal} from '@angular/core';
import {NavigationExtras, Router} from '@angular/router';

import { MessageService } from 'primeng/api';

import { UserService } from '../../services/user/user.service';
import { MESSAGES } from '../../shared/constants';
import {ErrorResponse, PlatformStatsResponse} from "../../shared/types/platform.types";

@Component({
  selector: 'app-progress',
  templateUrl: './platform.component.html',
  styleUrls: ['./platform.component.scss']
})
export class PlatformComponent implements OnInit {
  messageService: MessageService = inject(MessageService);
  userService: UserService = inject(UserService);

  loading : WritableSignal<boolean>  = signal<boolean>(false);

  // Platform stats
  activeUsers : WritableSignal<number> = signal<number>(0);
  totalQuestions : WritableSignal<number> = signal<number>(0);
  easyQuestions : WritableSignal<number> = signal<number>(0);
  mediumQuestions : WritableSignal<number> = signal<number>(0);
  hardQuestions : WritableSignal<number> = signal<number>(0);
  companyStats :  WritableSignal<Record<string, number>> = signal<Record<string, number>>({});
  topicStats :  WritableSignal<Record<string, number>> = signal<Record<string, number>>({});

  constructor(private router: Router) {
    this.fetchPlatformStats();
  }

  private filterEmptyKeys(stats: Record<string, number>): Record<string, number> {
    return Object.fromEntries(
      Object.entries(stats).filter(([key]) : boolean => key.trim() !== '')
    );
  }

  private fetchPlatformStats(): void {
    this.loading.set(true);

    this.userService.fetchPlatformStats().subscribe({
      next: (response : PlatformStatsResponse) => {
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
      error: (error: ErrorResponse) => {
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

  onTopicClick(topic: string): void {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        topic: topic.toLowerCase()
      }
    };
    this.router.navigate(['/questions'], navigationExtras);
  }

  onCompanyClick(company: string): void {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        company: company.toLowerCase()
      }
    };
    this.router.navigate(['/questions'], navigationExtras);
  }

  protected readonly Object : ObjectConstructor = Object;
}
