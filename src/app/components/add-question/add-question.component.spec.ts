import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddQuestionComponent } from './add-question.component';
import { AddQuestionConstants } from '../../shared/constants';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AddQuestionComponent', () => {
  let component: AddQuestionComponent;
  let fixture: ComponentFixture<AddQuestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddQuestionComponent],
      schemas: [NO_ERRORS_SCHEMA]  // Ignore unknown elements like app-header and file-upload
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Trigger initial data binding
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the header component', () => {
    const headerElement = fixture.nativeElement.querySelector('app-header');
    expect(headerElement).toBeTruthy();
  });

  it('should render the file upload component', () => {
    const fileUploadElement = fixture.nativeElement.querySelector('file-upload');
    expect(fileUploadElement).toBeTruthy();
  });

  it('should display the correct add question title', () => {
    const headingElement = fixture.nativeElement.querySelector('.heading');
    expect(headingElement.textContent).toContain(AddQuestionConstants.ADD_QUESTION_TITLE);
  });
});
