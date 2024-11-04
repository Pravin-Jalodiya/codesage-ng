// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginPayload = { username, password };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`http://localhost:8080/auth/login`, loginPayload, { headers })
      .pipe(
        map((response: any) => {
          if (response.code === 200) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userRole', response.role);
            return response;
          } else {
            throw new Error('Login not successful');
          }
        })
      );
  }
}
