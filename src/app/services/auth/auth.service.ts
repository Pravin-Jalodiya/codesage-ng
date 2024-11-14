import { Injectable, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { Observable } from 'rxjs';
import { Role } from "../../shared/config/roles.config";
import {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GetRoleResponse,
  LogoutResponse
} from "../../shared/types/auth.types";
import { AUTH_PATHS } from '../../shared/constants';
import { jwtDecode, JwtPayload as BaseJwtPayload } from "jwt-decode";

interface CustomJwtPayload extends BaseJwtPayload {
  username: string;
  userId: string;
  role: string;
  banState: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userRole: WritableSignal<Role> = signal<Role>(Role.USER);
  username: WritableSignal<string> = signal<string>("");
  loggedIn = signal<boolean>(this.hasToken());

  private readonly tokenKey = 'authToken';

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {
    if (this.loggedIn()) {
      this.getRole().subscribe({
        next: (response: GetRoleResponse) => this.handleRoleResponse(response),
        error: (error: any) => this.handleError(error),
        complete: () => console.log('Role request complete')
      });
    }
  }

  private handleRoleResponse(response: GetRoleResponse): void {
    if (response.code === 200) {
      localStorage.setItem('userRole', response.role);
      this.userRole.set(response.role as Role);
    }
  }

  private handleError(error: any): void {
    console.error('Request failed', error);
    this.showError(error.error.message);
    this.router.navigate(['/login']);
  }

  isTokenValid(): boolean {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) return false;

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const isExpired = !decodedToken.exp || decodedToken.exp * 1000 < Date.now();

      return !decodedToken.banState && !isExpired;
    } catch {
      localStorage.clear();
      return false;
    }
  }

  hasToken(): boolean {
    return this.isTokenValid();
  }

  getUsernameFromToken(): string | undefined {
    return this.extractFromToken(token => token?.username);
  }

  getUserIdFromToken(): string | undefined {
    return this.extractFromToken(token => token?.userId);
  }

  private extractFromToken<T>(extractor: (token: CustomJwtPayload | null) => T): T {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) return null as any;

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      if (!decodedToken.exp || decodedToken.exp * 1000 < Date.now() || decodedToken.banState) {
        localStorage.removeItem(this.tokenKey);
        return null as any;
      }

      return extractor(decodedToken);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null as any;
    }
  }

  getRole(): Observable<GetRoleResponse> {
    return this.http.get<GetRoleResponse>(AUTH_PATHS.ROLE);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const loginPayload: LoginRequest = { username, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<LoginResponse>(AUTH_PATHS.LOGIN, loginPayload, { headers });
  }

  signup(data: SignupRequest): Observable<SignupResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<SignupResponse>(AUTH_PATHS.SIGNUP, data, { headers });
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  handleSuccessfulLogin(response: LoginResponse): void {
    if (response && response.token) {
      // Store the JWT token
      localStorage.setItem('authToken', response.token);

      // Store user role and set signals
      this.userRole.set(response.role as Role);
      this.loggedIn.set(true);

    } else {
      console.error('Invalid response without token');
    }
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(AUTH_PATHS.LOGOUT, {});
  }
}
