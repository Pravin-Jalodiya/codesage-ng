import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable } from 'rxjs';


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
}
