import {Component, OnInit, signal, WritableSignal} from '@angular/core';
import {HttpClient, HttpEventType, HttpResponse} from "@angular/common/http";

import { MessageService, PrimeNGConfig} from 'primeng/api';

@Component({
  selector: 'file-upload',
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.scss'
})

export class FileUploadComponent implements OnInit {
  uploadUrl = 'http://localhost:8080/questions';
  files: any[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  uploadStatus: string = 'Pending';
  validationErrors: string[] = [];
  uploadProgress: WritableSignal<number> = signal<number>(0);
  toUpload: WritableSignal<boolean> = signal<boolean>(false);

  constructor(
    private config: PrimeNGConfig,
    private messageService: MessageService,
    private http: HttpClient,
  ) {}

  ngOnInit() {
    this.config.ripple = true;
  }

  choose(event: any, callback: () => void) {
    this.uploadProgress.set(0);
    callback();
  }

  uploadEvent(callback: () => void) {
    callback();
  }

  onSelectedFiles(event: { currentFiles: any[]; }) {
    this.toUpload.set(true);
    this.validationErrors = [];
    this.files = event.currentFiles;

    // Validate file
    const file = this.files[0];
    if (!this.validateFile(file)) {
      return;
    }

    this.totalSize = file.size;
    this.totalSizePercent = (this.totalSize / 1024000) * 100;
    this.uploadStatus = 'Ready';
  }

  validateFile(file: File): boolean {
    this.validationErrors = [];

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.validationErrors.push('Only CSV files are allowed');
    }

    if (file.size > 1024000) {
      this.validationErrors.push('File size exceeds 1MB limit');
    }

    // Read file header to validate CSV structure
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const firstLine = content.split('\n')[0];
      const headers = firstLine.split(',').map(header => header.trim().toLowerCase());
      console.log(headers)
      const requiredColumns = [
        'title_slug',
        'id',
        'title',
        'difficulty',
        'leetcode question link',
        'topic tags',
        'company tags'
      ];

      // Check if all required columns are present
      const missingColumns = requiredColumns.filter(col =>
        !headers.includes(col.toLowerCase())
      );

      if (missingColumns.length > 0) {
        this.validationErrors.push(
          `Missing required columns: ${missingColumns.join(', ')}`
        );
      }

      // Check for extra columns
      const extraColumns = headers.filter(col =>
        !requiredColumns.includes(col.toLowerCase())
      );

      if (extraColumns.length > 0) {
        this.validationErrors.push(
          `Extra columns found: ${extraColumns.join(', ')}`
        );
      }

      // Check if file is empty (only headers)
      const lines = content.trim().split('\n');
      if (lines.length < 2) {
        this.validationErrors.push('CSV file contains no data rows');
      }

      // Update UI if validation errors are found
      if (this.validationErrors.length > 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'CSV Validation Error',
          detail: 'Please fix the CSV file format',
          life: 5000
        });
      }
    };

    reader.onerror = () => {
      this.validationErrors.push('Error reading the CSV file');
    };

    reader.readAsText(file);

    console.log(this.validationErrors)
    return this.validationErrors.length === 0;
  }

  // Add a helper method to show a sample CSV format
  showSampleFormat() {
    const sampleFormat = `title_slug,ID,Title,Difficulty,Leetcode Question Link,Topic Tags,Company Tags
two-sum,1,Two Sum,Easy,https://leetcode.com/problems/two-sum,"Array,Hash Table","Amazon,Google"`;

    this.messageService.add({
      severity: 'info',
      summary: 'CSV Format Example',
      detail: 'Click to copy sample format',
      sticky: true,
      life: 5000,
      data: sampleFormat
    });
  }


  uploadFile(event: any) {
    if (this.validationErrors.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fix validation errors before uploading'
      });
      return;
    }

    const formData = new FormData();
    formData.append('questions_file', this.files[0]);

    this.http.post(this.uploadUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event: any) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress.set(Math.round(100 * event.loaded / event.total));
          this.uploadStatus = 'Uploading';
        } else if (event instanceof HttpResponse) {
          if (event.body?.code === 200) {
            this.uploadStatus = 'Completed';
            this.messageService.add({
              severity: 'info',
              summary: 'Success',
              detail: event.body.message
            });
          }
        }
      },
      error: (error: any) => {
        this.toUpload.set(false);
        this.uploadStatus = 'Failed';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'Upload failed'
        });
      }
    });
  }

  onUploadComplete(event: any) {
    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: 'File uploaded successfully'
    });
  }

  onError(event: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'File upload failed'
    });
  }

  onRemoveFile(event: any, file: any, removeFileCallback: (arg0: any, arg1: any) => void, index: any) {
    this.toUpload.set(false);
    removeFileCallback(event, index);
    this.totalSize = 0;
    this.totalSizePercent = 0;
    this.validationErrors = [];
    this.uploadStatus = 'Pending';
  }

  getProgressBarClass(): string {
    if (this.totalSizePercent <= 60) return 'progress-normal';
    if (this.totalSizePercent <= 90) return 'progress-warning';
    return 'progress-danger';
  }

  getStatusSeverity(): "success" | "info" | "warning" | "danger" | "help" | "primary" | "secondary" | "contrast" | null | undefined {
    switch (this.uploadStatus) {
      case 'Completed': return 'success';
      case 'Failed': return 'danger';
      case 'Uploading': return 'info';
      default: return 'contrast';
    }
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const dm = 2;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

downloadSampleFile() {
    const link = document.createElement('a');
    link.href = 'assets/sample-template.csv';
    link.download = 'sample-template.csv';
    link.click();
    link.remove();
  }
}
