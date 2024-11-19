import {Component, inject, signal, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {MessageService} from "primeng/api";
import {NavigationExtras, Router} from "@angular/router";

import { AuthService } from "../../services/auth/auth.service";
import {UserProgressResponse} from "../../shared/types/user.types";
import {MESSAGES} from "../../shared/constants";

interface RecentSubmission {
  title: string;
  id: string;
}

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.scss'
})

export class ProgressComponent implements OnInit{
  private http = inject(HttpClient);
  private messageService: MessageService = inject(MessageService);

  loading = signal<boolean>(false);

  // LeetCode Stats
  lcTotalQuestions = signal<number>(0);
  lcTotalProgress = signal<string>("");
  lcTotalDone = signal<number>(0);
  lcTotalEasy = signal<number>(0);
  lcTotalMedium = signal<number>(0);
  lcTotalHard = signal<number>(0);
  lcEasyDone = signal<number>(0);
  lcMediumDone = signal<number>(0);
  lcHardDone = signal<number>(0);

  // Combined signal for recent submissions
  recentSubmissions = signal<RecentSubmission[]>([]);

  // CodeSage Stats
  csTotalQuestions = signal<number>(0);
  csTotalProgress = signal<string>("");
  csTotalDone = signal<number>(0);
  csTotalEasy = signal<number>(0);
  csTotalMedium = signal<number>(0);
  csTotalHard = signal<number>(0);
  csEasyDone = signal<number>(0);
  csMediumDone = signal<number>(0);
  csHardDone = signal<number>(0);
  companyStats = signal<Record<string, number>>({});
  topicStats = signal<Record<string, number>>({});

  constructor(private authService: AuthService, private router: Router) {
    const username = this.authService.getUsernameFromToken();
    console.log("Progress constructor called!")
    if (username) {
      this.fetchUserProgress(username);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private fetchUserProgress(username: string): void {
    this.loading.set(true)

    this.http.get<UserProgressResponse>(`http://localhost:8080/users/progress/${username}`).subscribe({
      next: (response: UserProgressResponse) => {
        if(response.code === 200) {
          this.loading.set(false);
          // Update LeetCode progress
          this.lcTotalQuestions.set(response.leetcodeStats.TotalQuestionsCount);
          this.lcTotalDone.set(response.leetcodeStats.TotalQuestionsDoneCount);
          this.lcTotalEasy.set(response.leetcodeStats.TotalEasyCount);
          this.lcTotalMedium.set(response.leetcodeStats.TotalMediumCount);
          this.lcTotalHard.set(response.leetcodeStats.TotalHardCount);
          this.lcEasyDone.set(response.leetcodeStats.EasyDoneCount);
          this.lcMediumDone.set(response.leetcodeStats.MediumDoneCount);
          this.lcHardDone.set(response.leetcodeStats.HardDoneCount);
          this.lcTotalProgress.set(this.lcTotalDone()+ "/" + this.lcTotalQuestions());

          // Combine recent submission data
          const combinedSubmissions = response.leetcodeStats.recent_ac_submission_title.map(
            (title, index) => ({
              title,
              id: response.leetcodeStats.recent_ac_submission_ids[index]
            })
          );
          this.recentSubmissions.set(combinedSubmissions);

          // Update CodeSage progress
          this.csTotalQuestions.set(response.codesageStats.TotalQuestionsCount);
          this.csTotalDone.set(response.codesageStats.TotalQuestionsDoneCount);
          this.csTotalEasy.set(response.codesageStats.TotalEasyCount);
          this.csTotalMedium.set(response.codesageStats.TotalMediumCount);
          this.csTotalHard.set(response.codesageStats.TotalHardCount);
          this.csEasyDone.set(response.codesageStats.EasyDoneCount);
          this.csMediumDone.set(response.codesageStats.MediumDoneCount);
          this.csHardDone.set(response.codesageStats.HardDoneCount);
          this.companyStats.set(response.codesageStats.CompanyWiseStats);
          this.topicStats.set(response.codesageStats.TopicWiseStats);
          this.csTotalProgress.set(this.csTotalDone()+ "/" + this.csTotalQuestions());
        }
        },
      error: (error) => {
        this.messageService.add({
          severity: 'contrast',
          summary: 'Error',
          detail: MESSAGES.ERROR.PROGRESS_FETCH_FAILED,
        });
      }
    });
  }

  redirectToSubmission(submissionId: string): void {
    if (submissionId) {
      const link = `https://leetcode.com/submissions/detail/${submissionId}`;
      window.open(link, '_blank');
    }
  }

  protected readonly Object = Object;

  ngOnInit(): void {
  }

  onRefresh(): void {
    const username = this.authService.getUsernameFromToken();
    if (username) {
      this.fetchUserProgress(username);
    } else {
      this.router.navigate(['/login']);
    }
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
}
