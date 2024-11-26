import { Component, OnInit, computed, inject, Signal, signal, WritableSignal } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PaginatorState } from 'primeng/paginator';
import { debounceTime, Subject } from 'rxjs';

import { FilterOption, User, UserBanToggleResponse, UsersListResponse } from '../../shared/types/user.types';
import { AuthService } from '../../services/auth/auth.service';
import { UserService } from '../../services/user/user.service';
import { MESSAGES, UI_CONSTANTS, FILTER_OPTIONS } from '../../shared/constants';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrls: ['./users-table.component.scss']
})
export class UsersTableComponent implements OnInit {
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);

  role: Signal<string> = computed(() => this.authService.userRole());
  searchQuery: WritableSignal<string> = signal<string>('');
  userStates: FilterOption[] = FILTER_OPTIONS.USER_STATES;
  users: WritableSignal<User[]> = signal<User[]>([]);
  selectedState: WritableSignal<FilterOption | null> = signal<FilterOption | null>(null);

  // Pagination signals
  currentPage: WritableSignal<number> = signal<number>(0);
  pageSize: WritableSignal<number> = signal<number>(15);
  first: WritableSignal<number> = signal<number>(0);
  totalRecords: WritableSignal<number> = signal<number>(0);

  // Search debounce
  private searchSubject: Subject<string> = new Subject<string>();

  ngOnInit(): void {
    // Set up search debounce
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.first.set(0);
      this.fetchUsers();
    });

    this.fetchUsers(); // Initial user data load
  }

  private buildParams(): HttpParams {
    let params: HttpParams = new HttpParams()
      .set('offset', this.first().toString())
      .set('limit', this.pageSize().toString());

    if (this.searchQuery()) {
      params = params.set('searchQuery', this.searchQuery());
    }

    if (this.selectedState()) {
      const userStatus: boolean = this.selectedState()?.name.toLowerCase() === 'banned';
      params = params.set('userStatus', String(userStatus));
    }

    return params;
  }

  fetchUsers(): void {
    const params: HttpParams = this.buildParams();
    this.userService.getUsers(params).subscribe({
      next: (response: UsersListResponse) => {
        this.users.set(response.users);
        this.totalRecords.set(response.total); // Set total records for pagination
      },
      error: (error): void => {
        this.messageService.add({
          severity: 'error',
          summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
          detail: error.error?.message,
        });
      }
    });
  }

  onPageChange(event: PaginatorState): void {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.pageSize.set(event.rows);
    if (event.page !== undefined) this.currentPage.set(event.page);
    this.fetchUsers();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  onStatusSelect(Status: FilterOption | null): void {
    this.selectedState.set(Status);
    this.first.set(0);
    this.fetchUsers();
  }

  onUserDelete(user: User): void {
    this.confirmationService.confirm({
      message: MESSAGES.CONFIRM.DELETE_USER(user.username),
      header: MESSAGES.CONFIRM.DELETE_HEADER,
      icon: UI_CONSTANTS.ICONS.INFO_CIRCLE,
      accept: (): void => {
        const currentUsers = this.users();
        this.users.update((users) => users.filter(u => u.username !== user.username));

        this.userService.deleteUser(user.username).subscribe({
          next: (): void => {
            this.messageService.add({
              severity: 'info',
              summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY,
              detail: MESSAGES.SUCCESS.USER_DELETE
            });
          },
          error: (): void => {
            this.users.set(currentUsers); // Revert changes on error
            this.messageService.add({
              severity: 'error',
              summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
              detail: MESSAGES.ERROR.USER_DELETE_FAILED,
            });
          }
        });
      }
    });
  }

  onToggleBanStatus(event: any, user: User): void {
    const previousState = user.is_banned;
    user.is_banned = event.checked;

    this.userService.toggleUserBanState(user.username).subscribe({
      next: (response: UserBanToggleResponse): void => {
        this.messageService.add({
          severity: 'info',
          summary: MESSAGES.INFO.STATUS_UPDATED,
          detail: response.message,
        });
      },
      error: (): void => {
        user.is_banned = previousState;
        this.messageService.add({
          severity: 'error',
          summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
          detail: MESSAGES.ERROR.USER_UPDATE_FAILED,
        });
      }
    });
  }
}
