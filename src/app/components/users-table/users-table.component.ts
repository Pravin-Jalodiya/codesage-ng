// users-table.component.ts
import {Component, computed, inject, signal, WritableSignal} from '@angular/core';
import {AuthService} from "../../services/auth/auth.service";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {ConfirmationService, MessageService} from "primeng/api";
import {FormsModule} from "@angular/forms";

interface FilterOption {
  name: string;
}

interface UsersListResponse {
  code: number;
  message: string;
  total: number;
  users: User[];
}

interface UserBanToggleResponse {
  code: number,
  message: string;
}

interface User {
  role: string,
  username: string,
  name: string,
  email: string,
  organisation: string,
  country: string,
  is_banned: boolean,
  leetcode_id: string,
  last_seen: Date
}

@Component({
  selector: 'app-users-table',
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss'
})
export class UsersTableComponent {
  authService = inject(AuthService);
  private http: HttpClient = inject(HttpClient);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  role = computed<string>(() => this.authService.userRole());
  searchQuery = signal<string>("");
  userStates: FilterOption[] = [
    { name: 'Banned' },
    { name: 'Active' },
  ];
  users = signal<User[]>([]);
  selectedState = signal<FilterOption | undefined>(undefined);

  ngOnInit() {
    this.fetchUsers();
  }

  filteredUsers = computed<User[]>(() => {
    let filtered = this.users();

    // Apply search filter
    if (this.searchQuery()) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(this.searchQuery().toLowerCase())
      );
    }

    // Apply state filter
    if (this.selectedState()) {
      const state = this.selectedState()?.name.toLowerCase() === "banned";
      filtered = filtered.filter(user => user.is_banned === state);
    }

    return filtered;
  });

  fetchUsers() {
    this.http.get<UsersListResponse>('http://localhost:8080/users').subscribe({
      next: (response) => {
        this.users.set(response.users);
      },
      error: (error: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message,
        });
      }
    });
  }

  onUserDelete(user: User) {
    console.log("clicked registered!")
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.username}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const currentUsers = this.users();
        // const updatedUsers = currentUsers.filter(u => u.username !== user.username);
        // this.users.set(updatedUsers);
        this.users.update((currentUsers) => currentUsers.filter(u => u.username !== user.username));

        this.http.delete(`http://localhost:8080/users/delete?username=${user.username}`).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: 'User deleted successfully'
            });
          },
          error: (error) => {
            this.users.set(currentUsers);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error.message ?? "Failed to delete user",
            });
          }
        });
      }
    });
  }

  onToggleBanStatus(event: any, user: User) {
    // Store the previous state
    const previousState = user.is_banned;
    // Update the UI immediately
    user.is_banned = event.checked;

    // Force update of the signal to trigger change detection
    const currentUsers = this.users();
    this.users.set([...currentUsers]);

    this.http.patch<UserBanToggleResponse>(
      `http://localhost:8080/users/update-user-ban-state?username=${user.username}`,
      {}
    ).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'info',
          summary: 'Status Updated',
          detail: response.message,
        });
      },
      error: (error) => {
        // Revert the toggle state
        user.is_banned = previousState;
        // Force update of the signal to trigger change detection
        this.users.set([...currentUsers]);

        // Reset the slider programmatically
        event.source.writeValue(previousState);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error.message ?? "Failed to update user",
        });
      }
    });
  }
}
