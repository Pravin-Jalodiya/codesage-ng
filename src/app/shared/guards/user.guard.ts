import {
  CanActivateFn,
  Router
} from '@angular/router';
import { inject } from '@angular/core';
import { Observable, map, catchError, of } from 'rxjs';
import {AuthService} from "../../services/auth/auth.service";
import {Role} from "../config/roles.config";


export const userGuard: CanActivateFn = (): Observable<boolean> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getRole().pipe(
    map(response => {
      if (!response) {
        authService.showError('Authentication error');
        return false;
      }

      const isUser : boolean = response.role === Role.USER;
      if (!isUser) {
        // authService.showError('Unauthorized: User access required');
        router.navigate(['/not-found']);
      }
      return isUser;
    }),

    catchError(() => {
      authService.showError('Authentication error');
      router.navigate(['/']);
      return of(false);
    })
  );
};
