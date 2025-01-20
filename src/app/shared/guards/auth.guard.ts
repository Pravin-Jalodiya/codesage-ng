import {
  CanActivateFn,
  Router
} from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import {AuthService} from "../../services/auth/auth.service";


export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const authService : AuthService = inject(AuthService);
  const router : Router = inject(Router);

  if (!authService.loggedIn() || !authService.isTokenValid()) {
    router.navigate(['/login']);
    return of(false);
  }

  return of(true);
};
