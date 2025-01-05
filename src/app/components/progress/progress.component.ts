import {Component, inject, signal, OnInit, WritableSignal} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MessageService} from "primeng/api";
import {NavigationExtras, Router} from "@angular/router";

import { AuthService } from "../../services/auth/auth.service";
import {UserProgressResponse} from "../../shared/types/user.types";
import {MESSAGES} from "../../shared/constants";
import {UserService} from "../../services/user/user.service";

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
  private messageService: MessageService = inject(MessageService);
  private userService: UserService = inject(UserService);

  loading:  WritableSignal<boolean> = signal<boolean>(false);

  // LeetCode Stats
  lcTotalQuestions : WritableSignal<number> = signal<number>(0);
  lcTotalProgress : WritableSignal<string> = signal<string>("");
  lcTotalDone : WritableSignal<number> = signal<number>(0);
  lcTotalEasy : WritableSignal<number> = signal<number>(0);
  lcTotalMedium : WritableSignal<number> = signal<number>(0);
  lcTotalHard : WritableSignal<number> = signal<number>(0);
  lcEasyDone : WritableSignal<number> = signal<number>(0);
  lcMediumDone : WritableSignal<number> = signal<number>(0);
  lcHardDone : WritableSignal<number> = signal<number>(0);

  // Combined signal for recent submissions
  recentSubmissions: WritableSignal<RecentSubmission[]> = signal<RecentSubmission[]>([]);

  // CodeSage Stats
  csTotalQuestions : WritableSignal<number> = signal<number>(0);
  csTotalProgress :  WritableSignal<string>  = signal<string>("");
  csTotalDone : WritableSignal<number> = signal<number>(0);
  csTotalEasy : WritableSignal<number> = signal<number>(0);
  csTotalMedium : WritableSignal<number> = signal<number>(0);
  csTotalHard : WritableSignal<number> = signal<number>(0);
  csEasyDone : WritableSignal<number> = signal<number>(0);
  csMediumDone : WritableSignal<number> = signal<number>(0);
  csHardDone : WritableSignal<number> = signal<number>(0);
  companyStats : WritableSignal<Record<string, number>> = signal<Record<string, number>>({});
  topicStats : WritableSignal<Record<string, number>> = signal<Record<string, number>>({});

  constructor(private authService: AuthService, private router: Router) {
    const username : string | undefined = this.authService.getUsernameFromToken();
    if (username) {co
      this.fetchUserProgress(username);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private fetchUserProgress(username: string): void {
    this.loading.set(true)

    this.userService.getUserProgress(username).subscribe({
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
          const combinedSubmissions: { title: string, id: string }[] = response.leetcodeStats.recent_ac_submission_title.map(
            (title: string, index : number) : {id: string, title: string} => ({
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
      error: (error: HttpErrorResponse) : void => {
        this.loading.set(false);
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
      const link: string = `https://leetcode.com/submissions/detail/${submissionId}`;
      window.open(link, '_blank');
    }
  }

  protected readonly Object : ObjectConstructor = Object;

  ngOnInit(): void {
  }

  onRefresh(): void {
    const username : string | undefined = this.authService.getUsernameFromToken();
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
