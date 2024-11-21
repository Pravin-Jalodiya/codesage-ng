import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../shared/constants';
import { Observable } from 'rxjs';
import { NoBodyResponse, QuestionsResponse } from '../../shared/types/question.types';
import { HttpClient, HttpEvent, HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class QuestionService {

  constructor( private http: HttpClient) { }

  getQuestions(url: string, params?: HttpParams): Observable<QuestionsResponse>{
  return this.http.get<QuestionsResponse>(`${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.QUESTIONS.LIST}`, { params });
  }

  deleteQuestion(question_id: string): Observable<NoBodyResponse>{
   return this.http.delete<NoBodyResponse>(API_ENDPOINTS.QUESTIONS.DELETE(question_id));
  }

  uploadQuestions(formData: FormData): Observable<HttpEvent<NoBodyResponse>>{
    return this.http.post<NoBodyResponse>(API_ENDPOINTS.BASE_URL + API_ENDPOINTS.QUESTIONS.UPLOAD, formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
}
