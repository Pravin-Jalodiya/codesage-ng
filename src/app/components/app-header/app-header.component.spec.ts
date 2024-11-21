import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppHeaderComponent } from './app-header.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { HeaderConstants } from '../../shared/constants';
import { Role } from '../../shared/config/roles.config';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      userRole: { value: Role.USER, set: jasmine.createSpy('set') },
      loggedIn: { value: false, set: jasmine.createSpy('set') },
    });

    await TestBed.configureTestingModule({
      declarations: [AppHeaderComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render logo text with routerLink', () => {
    const logoElement: HTMLElement = fixture.nativeElement.querySelector('.logo-text');
    expect(logoElement.textContent).toContain(HeaderConstants.LOGO_TEXT);
    expect(logoElement.getAttribute('routerLink')).toBe('/');
  });

  it('should render QUESTIONS option', () => {
    const optionElement: HTMLElement = fixture.nativeElement.querySelector('.navbar-options .option');
    expect(optionElement.textContent).toContain(HeaderConstants.QUESTIONS);
  });

  it('should render PROGRESS option for USER role', () => {
    const progressElement: HTMLElement = fixture.nativeElement.querySelector('.navbar-options .option[routerLink="/progress"]');
    expect(progressElement).toBeTruthy();
  });

  // describe('when role is ADMIN', () => {
  //   beforeEach(() => {
  //     authServiceSpy.userRole.value = Role.ADMIN;
  //     fixture.detectChanges();
  //   });

    it('should render PLATFORM option for ADMIN role', () => {
      const platformElement: HTMLElement = fixture.nativeElement.querySelector('.navbar-options .option[routerLink="/platform"]');
      expect(platformElement).toBeTruthy();
    });

    it('should render USERS option for ADMIN role', () => {
      const usersElement: HTMLElement = fixture.nativeElement.querySelector('.navbar-options .option[routerLink="/users"]');
      expect(usersElement).toBeTruthy();
    });
  });

