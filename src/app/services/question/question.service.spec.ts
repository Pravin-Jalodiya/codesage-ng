import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpParams, HttpEventType, HttpResponse, HttpEvent, HttpProgressEvent } from '@angular/common/http';

import { QuestionService } from './question.service';
import { API_ENDPOINTS } from '../../shared/constants';
import { Question, QuestionsResponse, NoBodyResponse } from '../../shared/types/question.types';

describe('QuestionService', () => {
  let service: QuestionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [QuestionService]
    });

    service = TestBed.inject(QuestionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify that no unmatched requests are outstanding
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getQuestions', () => {
    const mockQuestionsResponse: QuestionsResponse = {
      code: 200,
      message: 'Questions retrieved successfully',
      questions: [
        {
          question_id: '1',
          question_title: 'Test Question',
          difficulty: 'Easy',
          question_link: 'https://example.com',
          topic_tags: ['Array'],
          company_tags: ['Google']
        }
      ],
      total: 1
    };

    it('should fetch questions without params', () => {
      service.getQuestions('').subscribe(response => {
        expect(response).toEqual(mockQuestionsResponse);
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.QUESTIONS.LIST}`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.toString()).toBe('');
      req.flush(mockQuestionsResponse);
    });

    it('should fetch questions with params', () => {
      const params = new HttpParams()
        .set('page', '1')
        .set('limit', '10');

      service.getQuestions('', params).subscribe(response => {
        expect(response).toEqual(mockQuestionsResponse);
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.QUESTIONS.LIST}?page=1&limit=10`
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.toString()).toBe('page=1&limit=10');
      req.flush(mockQuestionsResponse);
    });

    it('should handle error response', () => {
      const errorResponse = {
        status: 404,
        statusText: 'Not Found'
      };

      service.getQuestions('').subscribe({
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.QUESTIONS.LIST}`
      );
      req.flush('', errorResponse);
    });
  });

  describe('deleteQuestion', () => {
    const mockDeleteResponse: NoBodyResponse = {
      code: 200,
      message: 'Question deleted successfully'
    };

    it('should delete a question', () => {
      const questionId = '123';

      service.deleteQuestion(questionId).subscribe(response => {
        expect(response).toEqual(mockDeleteResponse);
      });

      const req = httpMock.expectOne(API_ENDPOINTS.QUESTIONS.DELETE(questionId));
      expect(req.request.method).toBe('DELETE');
      req.flush(mockDeleteResponse);
    });

    it('should handle delete error', () => {
      const questionId = '123';
      const errorResponse = {
        status: 404,
        statusText: 'Not Found'
      };

      service.deleteQuestion(questionId).subscribe({
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });

      const req = httpMock.expectOne(API_ENDPOINTS.QUESTIONS.DELETE(questionId));
      req.flush('', errorResponse);
    });
  });

  describe('uploadQuestions', () => {
    it('should upload questions and track progress', () => {
      const mockFormData = new FormData();
      mockFormData.append('file', new Blob(['test'], { type: 'text/csv' }), 'test.csv');

      const mockResponse: NoBodyResponse = {
        code: 200,
        message: 'Questions uploaded successfully'
      };

      service.uploadQuestions(mockFormData).subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progressEvent = event as HttpProgressEvent;
          expect(progressEvent.loaded).toBeDefined();
          expect(progressEvent.total).toBeDefined();
        }
        if (event.type === HttpEventType.Response) {
          const responseEvent = event as HttpResponse<NoBodyResponse>;
          expect(responseEvent.body).toEqual(mockResponse);
        }
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.QUESTIONS.UPLOAD}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockFormData);

      // Simulate upload progress
      const uploadProgress: HttpProgressEvent = {
        type: HttpEventType.UploadProgress,
        loaded: 50,
        total: 100
      };
      req.event(uploadProgress);

      // Simulate successful completion
      const response = new HttpResponse<NoBodyResponse>({
        body: mockResponse,
        status: 200
      });
      req.event(response);
    });

    it('should handle upload error', () => {
      const mockFormData = new FormData();
      const errorResponse = {
        status: 400,
        statusText: 'Bad Request'
      };

      service.uploadQuestions(mockFormData).subscribe({
        error: error => {
          expect(error.status).toBe(400);
          expect(error.statusText).toBe('Bad Request');
        }
      });

      const req = httpMock.expectOne(
        `${API_ENDPOINTS.BASE_URL}${API_ENDPOINTS.QUESTIONS.UPLOAD}`
      );
      req.flush('', errorResponse);
    });
  });
});
