import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AppHeaderComponent } from './app-header.component';
import { AuthService } from '../../services/auth/auth.service';
import {LogoutResponse} from "../../shared/types/auth.types";
import {CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA} from "@angular/core";


describe('AppHeaderComponent', () => {
  let component: AppHeaderComponent;
  let fixture: ComponentFixture<AppHeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockLogoutResponse: LogoutResponse = {
    code: 200,
    message: 'Logout successful'
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout', 'userRole'], {
      loggedIn: { set: jasmine.createSpy('set') }
    });
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ AppHeaderComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AppHeaderComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  // ... previous tests remain the same ...

  describe('onLogout', () => {
    beforeEach(() => {
      authService.logout.and.returnValue(of(mockLogoutResponse));
      spyOn(localStorage, 'removeItem');
    });

    it('should call authService logout and handle response', fakeAsync(() => {
      // Act
      component.onLogout();
      tick();

      // Assert
      expect(authService.logout).toHaveBeenCalled();
    }));

    it('should set loggedIn to false after successful logout', fakeAsync(() => {
      // Act
      component.onLogout();
      tick();

      // Assert
      expect(authService.loggedIn.set).toHaveBeenCalledWith(false);
    }));

    it('should remove items from localStorage after successful logout', fakeAsync(() => {
      // Act
      component.onLogout();
      tick();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userRole');
    }));

    it('should navigate to login page after successful logout', fakeAsync(() => {
      // Act
      component.onLogout();
      tick();

      // Assert
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    }));

    it('should perform all logout actions in correct order', fakeAsync(() => {
      // Arrange
      const executionOrder: string[] = [];

      authService.logout.and.callFake(() => {
        executionOrder.push('logout');
        return of(mockLogoutResponse);
      });

      (authService.loggedIn.set as jasmine.Spy).and.callFake((value: boolean) => {
        executionOrder.push('setLoggedIn');
      });

      (localStorage.removeItem as jasmine.Spy).and.callFake((key: string) => {
        executionOrder.push(`removeItem_${key}`);
      });

      router.navigate.and.callFake(() => {
        executionOrder.push('navigate');
        return Promise.resolve(true);
      });

      // Act
      component.onLogout();
      tick();

      // Assert
      expect(executionOrder).toEqual([
        'logout',
        'setLoggedIn',
        'removeItem_authToken',
        'removeItem_userRole',
        'navigate'
      ]);
    }));


    it('should handle logout errors gracefully', fakeAsync(() => {
      // Arrange
      const errorResponse: LogoutResponse = {
        code: 500,
        message: 'Logout failed'
      };
      authService.logout.and.returnValue(of(errorResponse));

      // Act
      component.onLogout();
      tick();

      // Assert
      // Add your error handling assertions here based on how your component handles errors
      expect(authService.logout).toHaveBeenCalled();
    }));
  });

});
