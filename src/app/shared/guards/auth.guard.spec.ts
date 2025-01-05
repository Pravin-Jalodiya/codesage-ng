// import { TestBed } from '@angular/core/testing';
// import { Router } from '@angular/router';
// import { of } from 'rxjs';
// import { authGuard } from './auth.guard';
// import { AuthService } from '../../services/auth/auth.service';
//
// describe('authGuard', () => {
//   let authServiceMock: any;
//   let routerMock: any;
//
//   beforeEach(() => {
//     authServiceMock = {
//       loggedIn: jasmine.createSpy(),
//       isTokenValid: jasmine.createSpy()
//     };
//
//     routerMock = {
//       navigate: jasmine.createSpy()
//     };
//
//     TestBed.configureTestingModule({
//       providers: [
//         { provide: AuthService, useValue: authServiceMock },
//         { provide: Router, useValue: routerMock }
//       ]
//     });
//   });
//
//   it('should navigate to /login and return false if the user is not logged in', (done) => {
//     authServiceMock.loggedIn.and.returnValue(false);
//
//     authGuard()().subscribe((result) => {
//       expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
//       expect(result).toBeFalse();
//       done();
//     });
//   });
//
//   it('should navigate to /login and return false if the token is invalid', (done) => {
//     authServiceMock.loggedIn.and.returnValue(true);
//     authServiceMock.isTokenValid.and.returnValue(false);
//
//     authGuard()().subscribe((result) => {
//       expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
//       expect(result).toBeFalse();
//       done();
//     });
//   });
//
//   it('should return true if the user is logged in and the token is valid', (done) => {
//     authServiceMock.loggedIn.and.returnValue(true);
//     authServiceMock.isTokenValid.and.returnValue(true);
//
//     authGuard()().subscribe((result) => {
//       expect(routerMock.navigate).not.toHaveBeenCalled();
//       expect(result).toBeTrue();
//       done();
//     });
//   });
// });
