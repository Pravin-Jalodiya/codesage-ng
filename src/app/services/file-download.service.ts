// src/app/services/file-download.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileDownloadService {
  constructor(private http: HttpClient) {}

  downloadFile(filePath: string): Observable<HttpResponse<Blob>> {
    return this.http.get(filePath, {
      observe: 'response',
      responseType: 'blob'
    });
  }
}
