import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable } from 'rxjs';
import {Role} from "../../config/roles.config";


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userRole: Role = Role.USER;
  username: string = "";

  private baseUrl = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    this.username = username;
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
