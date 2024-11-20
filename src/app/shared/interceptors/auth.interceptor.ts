import {HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest} from "@angular/common/http";
import {inject} from "@angular/core";
import { Router } from "@angular/router";

import {catchError, EMPTY, Observable, throwError} from "rxjs";

export const AuthInterceptor: HttpInterceptorFn =
  (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const skipUrls = ['/signup', '/login'];
    if(skipUrls.some(url => req.url.includes(url))) {
      return next(req);
    }

    const router = inject(Router)
    const token = localStorage.getItem('authToken')

    if(!token){
      router.navigate(['/login']);
      return EMPTY
    }

    const newRequest = req.clone({
      setHeaders: {Authorization: `Bearer ${token}`, Accept: "application/json"}
    })
    return next(newRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && error.error?.error_code === 2200) {
          // Redirect the user to the login page
          router.navigate(['/login']);
        }
        else if (error.status === 403 && error.error?.error_code === 9997) {
          router.navigate(['/']);
        }
        // Re-throw the error so other error handling can still occur
        return throwError(() => error);
      })
    );
}
