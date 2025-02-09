import {
  CanActivateFn,
  Router
} from '@angular/router';
import { inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import {AuthService} from "../../services/auth/auth.service";
import {Role} from "../config/roles.config";


export const adminGuard: CanActivateFn = (): Observable<boolean> => {
  const authService : AuthService = inject(AuthService);
  const router : Router = inject(Router);

  if (!authService.loggedIn()) {
    router.navigate(['/login']);
    return of(false);
  }

  if (!authService.isTokenValid()) {
    router.navigate(['/login']);
    return of(false);
  }

  return authService.getRole().pipe(
    map(response => {
      if (!response) {
        authService.showError('Authentication error');
        return false;
      }

      const isAdmin : boolean = response.role === Role.ADMIN;
      if (!isAdmin) {
        // authService.showError('Unauthorized: Admin access required');
        router.navigate(['/not-found']);
      }
      return isAdmin;
    }),

    catchError(() => {
      authService.showError('Authentication error');
      router.navigate(['/']);
      return of(false);
    })
  );
};
