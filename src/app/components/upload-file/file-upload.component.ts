import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {HttpEvent, HttpEventType, HttpResponse} from "@angular/common/http";

import { MessageService, PrimeNGConfig } from 'primeng/api';

import { QuestionService } from '../../services/question/question.service';
import { API_ENDPOINTS, MESSAGES, FILE_LIMITS, VALIDATION_RULES } from '../../shared/constants';
import {NoBodyResponse} from "../../shared/types/question.types";
import {FileSelectEvent, FileUploadErrorEvent, FileUploadEvent} from "primeng/fileupload";

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  uploadUrl = API_ENDPOINTS.QUESTIONS.UPLOAD;
  files: File[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  uploadStatus: string = MESSAGES.UPLOAD_STATUS.PENDING;
  validationErrors: string[] = [];
  uploadProgress: WritableSignal<number> = signal<number>(0);
  toUpload: WritableSignal<boolean> = signal<boolean>(false);

  private readonly requiredColumns: string[] = [
    'title_slug', 'id', 'title', 'difficulty',
    'leetcode question link', 'topic tags', 'company tags'
  ];

  constructor(
    private config: PrimeNGConfig,
    private messageService: MessageService,
    private questionService: QuestionService
  ) {}

  ngOnInit(): void {
    this.config.ripple = true;
  }

  choose(event: Event, chooseCallback: Function): void {
    event.preventDefault();
    chooseCallback();
  }

  uploadEvent(uploadCallback: Function): void {
    if (this.validationErrors.length === 0) {
      uploadCallback();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
        detail: MESSAGES.ERROR.FIX_VALIDATION_ERRORS
      });
    }
  }

  onUploadComplete(event: FileUploadEvent): void {
    this.uploadStatus = MESSAGES.UPLOAD_STATUS.COMPLETED;
    this.toUpload.set(false);
    this.messageService.add({
      severity: 'success',
      summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY,
      detail: MESSAGES.SUCCESS.UPLOAD_SUCCESS_DETAIL
    });
  }

  onError(event: FileUploadErrorEvent): void {
    this.uploadStatus = MESSAGES.UPLOAD_STATUS.FAILED;
    this.toUpload.set(false);
    this.messageService.add({
      severity: 'error',
      summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
      detail: event.error?.message || MESSAGES.ERROR.UPLOAD_FAILED
    });
  }

  onSelectedFiles(event: FileSelectEvent): void {
    this.toUpload.set(true);
    this.validationErrors = [];
    this.files = event.currentFiles;
    this.uploadProgress.set(0);

    const file: File = this.files[0];
    if (!this.validateFile(file)) {
      this.toUpload.set(false);
      return;
    }

    this.totalSize = file.size;
    this.totalSizePercent = (this.totalSize / FILE_LIMITS.MAX_SIZE_BYTES) * 100;
    this.uploadStatus = MESSAGES.UPLOAD_STATUS.READY;
  }

  private validateFile(file: File): boolean {
    this.validationErrors = [];

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.validationErrors.push(MESSAGES.ERROR.FILE_TYPE);
      return false;
    }

    if (file.size > FILE_LIMITS.MAX_SIZE_BYTES) {
      this.validationErrors.push(MESSAGES.ERROR.FILE_SIZE);
      return false;
    }

    const reader: FileReader = new FileReader();
    reader.onload = () => this.processFileContent(reader.result as string);
    reader.onerror = () => {
      this.validationErrors.push(MESSAGES.ERROR.FILE_READ_ERROR);
      this.displayValidationErrors();
    };

    reader.readAsText(file);
    return this.validationErrors.length === 0;
  }

  private processFileContent(content: string): void {
    const lines: string[] = content.trim().split('\n');
    const headers: string[] = lines[0].split(',').map(h => h.trim().toLowerCase());

    const missingColumns: string[] = this.requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      this.validationErrors.push(`${MESSAGES.ERROR.MISSING_COLUMNS}: ${missingColumns.join(', ')}`);
    }

    const extraColumns: string[] = headers.filter(h => !this.requiredColumns.includes(h));
    if (extraColumns.length > 0) {
      this.validationErrors.push(`${MESSAGES.ERROR.EXTRA_COLUMNS}: ${extraColumns.join(', ')}`);
    }

    if (lines.length < 2) {
      this.validationErrors.push(MESSAGES.ERROR.NO_DATA_ROWS);
    }

    if (this.validationErrors.length > 0) {
      this.displayValidationErrors();
    }
  }

  private displayValidationErrors(): void {
    this.messageService.add({
      severity: 'error',
      summary: MESSAGES.ERROR.CSV_VALIDATION_ERROR_SUMMARY,
      detail: MESSAGES.ERROR.CSV_VALIDATION_ERROR_DETAIL,
      life: 5000
    });
  }

  uploadFile(): void {
    if (this.validationErrors.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: MESSAGES.ERROR.FIX_VALIDATION_ERRORS
      });
      return;
    }

    const formData: FormData = new FormData();
    formData.append('questions_file', this.files[0]);

    this.questionService.uploadQuestions(formData).subscribe({
      next: (event: any) => this.handleUploadEvent(event),
      error: (error) => this.handleError(error)
    });
  }

  private handleUploadEvent(event: any): void {
    if (event.type === HttpEventType.UploadProgress) {
      this.uploadProgress.set(Math.round(100 * event.loaded / event.total));
      this.uploadStatus = MESSAGES.UPLOAD_STATUS.UPLOADING;
    } else if (event instanceof HttpResponse) {
      if (event.body?.code === 200) {
        this.uploadStatus = MESSAGES.UPLOAD_STATUS.COMPLETED;
        this.messageService.add({
          severity: 'info',
          summary: MESSAGES.SUCCESS.GENERAL_SUCCESS_SUMMARY,
          detail: event.body.message
        });
      }
    }
  }

  private handleError(error: { error: { message: string; }; }): void {
    this.toUpload.set(false);
    this.uploadStatus = MESSAGES.UPLOAD_STATUS.FAILED;
    this.messageService.add({
      severity: 'error',
      summary: MESSAGES.ERROR.GENERAL_ERROR_SUMMARY,
      detail: error.error?.message || MESSAGES.ERROR.UPLOAD_FAILED
    });
  }

  onRemoveFile(event: MouseEvent , file: any, removeFileCallback: (arg0: any, arg1: any) => void, index: number): void {
    this.toUpload.set(false);
    removeFileCallback(event, index);
    this.resetFileUploadState();
    this.uploadProgress.set(0);
  }

  private resetFileUploadState(): void {
    this.totalSize = 0;
    this.totalSizePercent = 0;
    this.validationErrors = [];
    this.uploadStatus = MESSAGES.UPLOAD_STATUS.PENDING;
  }

  getProgressBarClass(): string {
    return this.totalSizePercent <= 60 ? 'progress-normal' :
           this.totalSizePercent <= 90 ? 'progress-warning' :
           'progress-danger';
  }

  getStatusSeverity(): "success" | "danger" | "info" | "contrast" {
    switch (this.uploadStatus) {
      case MESSAGES.UPLOAD_STATUS.COMPLETED: return 'success';
      case MESSAGES.UPLOAD_STATUS.FAILED: return 'danger';
      case MESSAGES.UPLOAD_STATUS.UPLOADING: return 'info';
      default: return 'contrast';
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k: number = 1024, dm: number = 2, sizes: string[] = ['B', 'KB', 'MB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  downloadSampleFile() {
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = 'assets/sample-template.csv';
    link.download = 'sample-template.csv';
    link.click();
    link.remove();
  }
}
