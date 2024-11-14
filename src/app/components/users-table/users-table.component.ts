import {Component, computed, inject, signal} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";

import {ConfirmationService, MessageService} from "primeng/api";
import {PaginatorState} from 'primeng/paginator';

import {AuthService} from "../../services/auth/auth.service";
import {FilterOption, User, UsersListResponse} from '../../shared/types/user.types';
import {UserService} from '../../services/user/user.service';
import {MESSAGES, UI_CONSTANTS, FILTER_OPTIONS} from '../../shared/constants';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss'
})
export class UsersTableComponent {
  authService = inject(AuthService);
  userService = inject(UserService);
  private http: HttpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  role = computed<string>(() => this.authService.userRole());
  searchQuery = signal<string>("");
  userStates: FilterOption[] = FILTER_OPTIONS.USER_STATES;
  users = signal<User[]>([]);
  selectedState = signal<FilterOption | undefined>(undefined);

  // Pagination signals
  currentPage = signal<number>(0);
  pageSize = signal<number>(15);
  first = signal<number>(0);

  ngOnInit() {
    this.fetchUsers();
  }

  filteredUsers = computed<User[]>(() => {
    let filtered = this.users();

    if (this.searchQuery()) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedState()) {
      const state = this.selectedState()?.name.toLowerCase() === "banned";
      filtered = filtered.filter(user => user.is_banned === state);
    }

    return filtered;
  });

  paginatedUsers = computed(() => {
    const filtered = this.filteredUsers();
    const startIndex = this.first();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  totalRecords = computed(() => this.filteredUsers().length);

  onPageChange(event: PaginatorState) {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.pageSize.set(event.rows);
    if (event.page !== undefined) this.currentPage.set(event.page);
  }

  fetchUsers() {
    this.userService.getUsers().subscribe({
      next: (response: UsersListResponse) => {
        this.users.set(response.users);
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
          detail: error.error.message,
        });
      }
    });
  }

  onUserDelete(user: User) {
    this.confirmationService.confirm({
      message: MESSAGES.CONFIRM.DELETE_USER(user.username),
      header: MESSAGES.CONFIRM.DELETE_USER_HEADER,
      icon: UI_CONSTANTS.ICONS.INFO_CIRCLE,
      acceptButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.DANGER_TEXT,
      rejectButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.TEXT,
      acceptIcon: UI_CONSTANTS.ICONS.NONE,
      rejectIcon: UI_CONSTANTS.ICONS.NONE,
      accept: () => {
        const currentUsers = this.users();
        this.users.update((currentUsers) => currentUsers.filter(u => u.username !== user.username));

        this.userService.deleteUser(user.username).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY,
              detail: MESSAGES.SUCCESS.USER_DELETE
            });
          },
          error: (error) => {
            this.users.set(currentUsers);
            this.messageService.add({
              severity: 'error',
              summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
              detail: error.error.message ?? MESSAGES.ERROR.USER_DELETE_FAILED,
            });
          }
        });
      }
    });
  }

  onToggleBanStatus(event: any, user: User) {
    const previousState = user.is_banned;
    user.is_banned = event.checked;

    const currentUsers = this.users();
    this.users.set([...currentUsers]);

    this.userService.toggleUserBanState(user.username, {}).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'info',
          summary: MESSAGES.INFO.STATUS_UPDATED,
          detail: response.message,
        });
      },
      error: (error) => {
        user.is_banned = previousState;
        this.users.set([...currentUsers]);
        event.source.writeValue(previousState);

        this.messageService.add({
          severity: 'error',
          summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
          detail: error.error.message ?? MESSAGES.ERROR.USER_UPDATE_FAILED,
        });
      }
    });
  }
}
