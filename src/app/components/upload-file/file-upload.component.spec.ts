import { ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpResponse, HttpEventType, HttpEvent} from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { FileUploadComponent } from './file-upload.component';
import { MessageService } from "primeng/api";
import { QuestionService } from "../../services/question/question.service";
import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MESSAGES, FILE_LIMITS } from '../../shared/constants';
import {NoBodyResponse} from "../../shared/types/question.types";

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;
  let messageService: jasmine.SpyObj<MessageService>;
  let questionService: jasmine.SpyObj<QuestionService>;

  beforeEach(async () => {
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    questionService = jasmine.createSpyObj('QuestionService', ['uploadQuestions']);

    await TestBed.configureTestingModule({
      declarations: [FileUploadComponent],
      providers: [
        { provide: MessageService, useValue: messageService },
        { provide: QuestionService, useValue: questionService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('File Selection and Validation', () => {
    it('should handle file selection with valid CSV file', () => {
      const validFile = new File(['valid content'], 'test.csv', { type: 'text/csv' });
      const event = { currentFiles: [validFile] };

      const mockFileReader = {
        result: 'title_slug,id,title,difficulty,leetcode question link,topic tags,company tags\ndata,1,Test,Easy,link,tag1,company1',
        readAsText: function(file: Blob) {
          // setTimeout(() => this.onload(), 0);
        }
      };
      spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

      component.onSelectedFiles(event as any);
      expect(component.files).toEqual([validFile]);
      expect(component.toUpload()).toBeTruthy();
      expect(component.validationErrors.length).toBe(0);
    });

    it('should reject invalid file type', () => {
      const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      const event = { currentFiles: [invalidFile] };

      component.onSelectedFiles(event as any);
      expect(component.validationErrors).toContain(MESSAGES.ERROR.FILE_TYPE);
      expect(component.toUpload()).toBeFalse();
    });

    it('should reject file exceeding size limit', () => {
      const largeFile = new File(['x'.repeat(FILE_LIMITS.MAX_SIZE_BYTES + 1)], 'large.csv', { type: 'text/csv' });
      const event = { currentFiles: [largeFile] };

      component.onSelectedFiles(event as any);
      expect(component.validationErrors).toContain(MESSAGES.ERROR.FILE_SIZE);
      expect(component.toUpload()).toBeFalse();
    });
  });

  describe('File Upload', () => {
    describe('File Upload', () => {
      it('should handle successful file upload', () => {
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });
        component.files = [file];
        component.validationErrors = [];

        const successResponse: HttpEvent<NoBodyResponse> = new HttpResponse<NoBodyResponse>({
          body: {
            code: 200,
            message: 'Success',
          }
        });
        questionService.uploadQuestions.and.returnValue(of(successResponse));

        component.uploadFile();

        expect(questionService.uploadQuestions).toHaveBeenCalled();
        expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.COMPLETED);
        expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
          severity: 'info',
          summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY
        }));
      });

      it('should handle upload progress', () => {
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });
        component.files = [file];
        component.validationErrors = [];

        const progressEvent: HttpEvent<NoBodyResponse> = {
          type: HttpEventType.UploadProgress,
          loaded: 50,
          total: 100
        };

        questionService.uploadQuestions.and.returnValue(of(progressEvent));

        component.uploadFile();

        expect(component.uploadProgress()).toBe(50);
        expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.UPLOADING);
      });

      it('should handle upload error', () => {
        const file = new File(['content'], 'test.csv', { type: 'text/csv' });
        component.files = [file];
        component.validationErrors = [];

        const errorResponse = {
          error: {
            code: 400,
            message: 'Upload failed',
            data: null
          }
        };
        questionService.uploadQuestions.and.returnValue(throwError(() => errorResponse));

        component.uploadFile();

        expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.FAILED);
        expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
          severity: 'error',
          detail: 'Upload failed'
        }));
      });
    });

    it('should handle successful file upload', () => {
      const file = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.files = [file];
      component.validationErrors = [];

      const successResponse = new HttpResponse({ body: { code: 200, message: 'Success' } });
      questionService.uploadQuestions.and.returnValue(of(successResponse));

      component.uploadFile();

      expect(questionService.uploadQuestions).toHaveBeenCalled();
      expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.COMPLETED);
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'info',
        summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY
      }));
    });

    it('should handle upload error', () => {
      const file = new File(['content'], 'test.csv', { type: 'text/csv' });
      component.files = [file];
      component.validationErrors = [];

      const errorResponse = { error: { message: 'Upload failed' } };
      questionService.uploadQuestions.and.returnValue(throwError(() => errorResponse));

      component.uploadFile();

      expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.FAILED);
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        detail: 'Upload failed'
      }));
    });
  });

  describe('Utility Functions', () => {
    it('should format file size correctly', () => {
      expect(component.formatSize(0)).toBe('0 B');
      expect(component.formatSize(1024)).toBe('1 KB');
      expect(component.formatSize(1048576)).toBe('1 MB');
    });

    it('should return correct progress bar class', () => {
      component.totalSizePercent = 50;
      expect(component.getProgressBarClass()).toBe('progress-normal');

      component.totalSizePercent = 80;
      expect(component.getProgressBarClass()).toBe('progress-warning');

      component.totalSizePercent = 95;
      expect(component.getProgressBarClass()).toBe('progress-danger');
    });

    it('should return correct status severity', () => {
      component.uploadStatus = MESSAGES.UPLOAD_STATUS.COMPLETED;
      expect(component.getStatusSeverity()).toBe('success');

      component.uploadStatus = MESSAGES.UPLOAD_STATUS.FAILED;
      expect(component.getStatusSeverity()).toBe('danger');

      component.uploadStatus = MESSAGES.UPLOAD_STATUS.UPLOADING;
      expect(component.getStatusSeverity()).toBe('info');

      component.uploadStatus = MESSAGES.UPLOAD_STATUS.PENDING;
      expect(component.getStatusSeverity()).toBe('contrast');
    });
  });

  describe('File Removal', () => {
    it('should handle file removal correctly', () => {
      const mockEvent = new MouseEvent('click');
      const mockFile = new File(['content'], 'test.csv', { type: 'text/csv' });
      const mockRemoveCallback = jasmine.createSpy('removeFileCallback');

      component.onRemoveFile(mockEvent, mockFile, mockRemoveCallback, 0);

      expect(component.toUpload()).toBeFalse();
      expect(component.totalSize).toBe(0);
      expect(component.totalSizePercent).toBe(0);
      expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.PENDING);
      expect(mockRemoveCallback).toHaveBeenCalledWith(mockEvent, 0);
    });
  });

  describe('Event Handlers', () => {
    it('should handle choose event', () => {
      const mockEvent = new MouseEvent('click');
      const mockCallback = jasmine.createSpy('chooseCallback');

      component.choose(mockEvent, mockCallback);

      expect(mockCallback).toHaveBeenCalled();
    });

    it('should handle upload event with validation errors', () => {
      const mockCallback = jasmine.createSpy('uploadCallback');
      component.validationErrors = ['Error'];

      component.uploadEvent(mockCallback);

      expect(mockCallback).not.toHaveBeenCalled();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        detail: MESSAGES.ERROR.FIX_VALIDATION_ERRORS
      }));
    });

    it('should handle upload complete event', () => {
      const mockEvent = { files: [] } as any;

      component.onUploadComplete(mockEvent);

      expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.COMPLETED);
      expect(component.toUpload()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        detail: MESSAGES.SUCCESS.UPLOAD_SUCCESS_DETAIL
      }));
    });

    it('should handle upload error event', () => {
      const mockEvent = { error: { message: 'Error message' } } as any;

      component.onError(mockEvent);

      expect(component.uploadStatus).toBe(MESSAGES.UPLOAD_STATUS.FAILED);
      expect(component.toUpload()).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        detail: 'Error message'
      }));
    });
  });

  describe('Sample File Download', () => {
    it('should trigger sample file download', () => {
      const mockLink = jasmine.createSpyObj('HTMLAnchorElement', ['click', 'remove']);
      spyOn(document, 'createElement').and.returnValue(mockLink);

      component.downloadSampleFile();

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.href).toContain('assets/sample-template.csv');
      expect(mockLink.download).toBe('sample-template.csv');
      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.remove).toHaveBeenCalled();
    });
  });

  describe('FileUploadComponent - processFileContent', () => {
    it('should detect missing required columns', () => {
      const content = 'title_slug,id\n1,Test';
      component.requiredColumns = ['title_slug', 'id', 'title'];
      spyOn(component, 'displayValidationErrors');

      component['processFileContent'](content);

      expect(component.validationErrors).toContain(
        `${MESSAGES.ERROR.MISSING_COLUMNS}: title`
      );
      expect(component.displayValidationErrors).toHaveBeenCalled();
    });

    it('should detect extra columns not in requiredColumns', () => {
      const content = 'title_slug,id,extra_column\n1,Test,extra';
      component.requiredColumns = ['title_slug', 'id'];
      spyOn(component, 'displayValidationErrors');

      component['processFileContent'](content);

      expect(component.validationErrors).toContain(
        `${MESSAGES.ERROR.EXTRA_COLUMNS}: extra_column`
      );
      expect(component.displayValidationErrors).toHaveBeenCalled();
    });

    it('should detect when no data rows are present', () => {
      const content = 'title_slug,id,title';
      component.requiredColumns = ['title_slug', 'id', 'title'];
      spyOn(component, 'displayValidationErrors');

      component['processFileContent'](content);

      expect(component.validationErrors).toContain(MESSAGES.ERROR.NO_DATA_ROWS);
      expect(component.displayValidationErrors).toHaveBeenCalled();
    });

    it('should validate content correctly without errors', () => {
      const content = 'title_slug,id,title\nslug1,1,Test';
      component.requiredColumns = ['title_slug', 'id', 'title'];
      spyOn(component, 'displayValidationErrors');

      component['processFileContent'](content);

      expect(component.validationErrors.length).toBe(0);
      expect(component.displayValidationErrors).not.toHaveBeenCalled();
    });

    it('should trim header and ignore case sensitivity', () => {
      const content = '  Title_Slug ,  id , TiTlE\nslug1,1,Test';
      component.requiredColumns = ['title_slug', 'id', 'title'];
      spyOn(component, 'displayValidationErrors');

      component['processFileContent'](content);

      expect(component.validationErrors.length).toBe(0);
      expect(component.displayValidationErrors).not.toHaveBeenCalled();
    });
  });

});
