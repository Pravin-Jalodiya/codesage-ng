import {
  CanActivateFn,
  Router
} from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import {AuthService} from "../../services/auth/auth.service";


export const authGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.loggedIn()) {
    router.navigate(['/login']);
    return of(false);
  }

  if (!authService.isTokenValid()) {
    router.navigate(['/login']);
    return of(false);
  }

  return of(true);
};
