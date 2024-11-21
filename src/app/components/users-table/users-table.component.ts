import {Component, computed, inject, Signal, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpErrorResponse} from "@angular/common/http";

import {ConfirmationService, MessageService} from "primeng/api";
import {PaginatorState} from 'primeng/paginator';

import {AuthService} from "../../services/auth/auth.service";
import {FilterOption, User, UserBanToggleResponse, UsersListResponse} from '../../shared/types/user.types';
import {UserService} from '../../services/user/user.service';
import {MESSAGES, UI_CONSTANTS, FILTER_OPTIONS} from '../../shared/constants';

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss'
})
export class UsersTableComponent {
  authService: AuthService = inject(AuthService);
  userService: UserService = inject(UserService);
  private http: HttpClient = inject(HttpClient);
  private messageService: MessageService = inject(MessageService);
  private confirmationService: ConfirmationService = inject(ConfirmationService);

  role: Signal<string> = computed<string>(() => this.authService.userRole());
  searchQuery: WritableSignal<string> = signal<string>("");
  userStates: FilterOption[] = FILTER_OPTIONS.USER_STATES;
  users: WritableSignal<User[]> = signal<User[]>([]);
  selectedState: WritableSignal<FilterOption | undefined> = signal<FilterOption | undefined>(undefined);

  // Pagination signals
  currentPage: WritableSignal<number> = signal<number>(0);
  pageSize:  WritableSignal<number> = signal<number>(15);
  first:  WritableSignal<number> = signal<number>(0);

  ngOnInit(): void {
    this.fetchUsers();
  }

  filteredUsers: Signal<User[]> = computed<User[]>(() => {
    let filtered: User[] = this.users();

    if (this.searchQuery()) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    if (this.selectedState()) {
      const state: boolean = this.selectedState()?.name.toLowerCase() === "banned";
      filtered = filtered.filter(user => user.is_banned === state);
    }

    return filtered;
  });

  paginatedUsers : Signal<User[]> = computed(() => {
    const filtered : User[] = this.filteredUsers();
    const startIndex: number = this.first();
    const endIndex: number = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  totalRecords: Signal<number> = computed(() => this.filteredUsers().length);

  onPageChange(event: PaginatorState): void {
    if (event.first !== undefined) this.first.set(event.first);
    if (event.rows !== undefined) this.pageSize.set(event.rows);
    if (event.page !== undefined) this.currentPage.set(event.page);
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe({
      next: (response: UsersListResponse) => {
        this.users.set(response.users);
      },
      error: (error: HttpErrorResponse): void => {
        this.messageService.add({
          severity: 'error',
          summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
          detail: error.error.message,
        });
      }
    });
  }

  onUserDelete(user: User): void {
    this.confirmationService.confirm({
      message: MESSAGES.CONFIRM.DELETE_USER(user.username),
      header: MESSAGES.CONFIRM.DELETE_HEADER,
      icon: UI_CONSTANTS.ICONS.INFO_CIRCLE,
      acceptButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.DANGER_TEXT,
      rejectButtonStyleClass: UI_CONSTANTS.BUTTON_STYLES.TEXT,
      acceptIcon: UI_CONSTANTS.ICONS.NONE,
      rejectIcon: UI_CONSTANTS.ICONS.NONE,
      accept: (): void => {
        const currentUsers: User[] = this.users();
        this.users.update((currentUsers: User[]) => currentUsers
          .filter(u => u.username !== user.username));

        this.userService.deleteUser(user.username).subscribe({
          next: (): void => {
            this.messageService.add({
              severity: 'info',
              summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY,
              detail: MESSAGES.SUCCESS.USER_DELETE
            });
          },
          error: (error): void => {
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

  onToggleBanStatus(event: any, user: User): void {
    const previousState: boolean = user.is_banned;
    user.is_banned = event.checked;

    const currentUsers: User[] = this.users();
    this.users.set([...currentUsers]);

    this.userService.toggleUserBanState(user.username, {}).subscribe({
      next: (response : UserBanToggleResponse): void => {
        this.messageService.add({
          severity: 'info',
          summary: MESSAGES.INFO.STATUS_UPDATED,
          detail: response.message,
        });
      },
      error: (error): void => {
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
