import {Injectable, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from "@angular/router";

import {MessageService} from "primeng/api";
import {Observable } from 'rxjs';

import {Role} from "../../shared/config/roles.config";
import {jwtDecode, JwtPayload as BaseJwtPayload} from "jwt-decode";

// Extend the base JWT payload with our custom fields
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

  private baseUrl = 'http://localhost:8080/auth';

  private tokenKey = 'authToken';

  getUsernameFromToken(): string | null {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) {
        return null;
      }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);

      // Check if token is expired
      if (!decodedToken.exp || decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem(this.tokenKey);
        return null;
      }

      // Check if user is banned
      if (decodedToken.banState) {
        localStorage.removeItem(this.tokenKey);
        return null;
      }

      return decodedToken.username;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  getUserIdFromToken(): string | null {
    try {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) {
        return null;
      }

      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      return decodedToken.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  isTokenValid(): boolean {
    try {
      console.log("is token valid funtion here i should be called");
      const token = localStorage.getItem('authToken');
      if (!token) {
        return false;
      }
      console.log(token)

      const decodedToken = jwtDecode<CustomJwtPayload>(token);

      // Check if exp exists before using it
      const isExpired = !decodedToken.exp || decodedToken.exp * 1000 < Date.now();
      console.log(isExpired)

      return !decodedToken.banState && !isExpired;
    } catch {
      localStorage.clear();
      return false;
    }
  }


  constructor(private http: HttpClient, private messageService: MessageService, private router: Router ) {
    console.log("auth service construtor");
    console.log(this.loggedIn());
      if(this.loggedIn()){
      this.getRole().subscribe(({
        next: (response: any) => {
          console.log('Request successful:', response);
          if (response.code === 200) {
            console.log(response.role)
            localStorage.setItem('userRole', response.role);
            this.userRole.set(response.role);
            console.log("role admin has beeen set",response.role);
          }},
        error: (error: any) => {
          console.error('Login failed', error);
          this.showError(error.error.message);
          router.navigate(['/login']);
        },
        complete: () => {
          console.log('request complete');
        }
      }));
  }}

  hasToken(): boolean {
    return this.isTokenValid();
  }

  getRole(): Observable<any> {
    return this.http.get(`${this.baseUrl}/member/role`)
  }

  login(username: string, password: string): Observable<any> {
    this.username.set(username);
    const loginPayload = { username, password };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/login`, loginPayload, { headers })
  }

  signup(username: string, password: string, name: string, email: string, organisation: string, country: string, leetcodeId: string): Observable<any> {
    const signupPayload = {
      username,
      password,
      name,
      email,
      organisation,
      country,
      leetcode_id: leetcodeId
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.baseUrl}/signup`, signupPayload, { headers });
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'contrast', summary: 'Error', detail: message });
  }

  logout(){
    return this.http.post(`${this.baseUrl}/member/logout`, {});
  }

}
