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
  loggedIn: WritableSignal<boolean> = signal<boolean>(this.hasToken());

  private readonly tokenKey = 'authToken';

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {
    console.log("Role has been set!")
    if (this.loggedIn()) {
      console.log("Role has been set!")
      this.getRole().subscribe({
        next: (response: GetRoleResponse) => this.handleRoleResponse(response),
        error: (error: any) => this.handleError(error),
      });
    }
  }

  private handleRoleResponse(response: GetRoleResponse): void {
    console.log(response.role)
    if (response.code === 200) {
      localStorage.setItem('userRole', response.role);
      this.userRole.set(response.role as Role);
    }
  }

  private handleError(error: any): void {
    this.showError(error.error.message);
    this.router.navigate(['/login']);
  }

  isTokenValid(): boolean {
    try {
      const token = localStorage.getItem('authToken');
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
      const token = localStorage.getItem('authToken');
      if (!token) return null as any;

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      if (!decodedToken.exp || decodedToken.exp * 1000 < Date.now() || decodedToken.banState) {
        localStorage.removeItem(this.tokenKey);
        return null as any;
      }

      return extractor(decodedToken);
    } catch (error) {
      return null as any;
    }
  }

  getRole(): Observable<GetRoleResponse> {
    return this.http.get<GetRoleResponse>(AUTH_PATHS.ROLE);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const loginPayload: LoginRequest = { username, password };

    return this.http.post<LoginResponse>(AUTH_PATHS.LOGIN, loginPayload);
  }

  signup(data: SignupRequest): Observable<SignupResponse> {

    return this.http.post<SignupResponse>(AUTH_PATHS.SIGNUP, data);
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  handleSuccessfulLogin(response: LoginResponse): void {
    if (response && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('userRole', response.role);
      this.userRole.set(response.role as Role);
      this.loggedIn.set(true);

    }
  }

  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(AUTH_PATHS.LOGOUT, {});
  }
}
