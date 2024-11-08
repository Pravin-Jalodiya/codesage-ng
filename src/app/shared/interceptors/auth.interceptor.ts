import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";

import { EMPTY, Observable } from "rxjs";


export const AuthInterceptor: HttpInterceptorFn =
  (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const skipUrls = ['/signup', '/login'];
    if(skipUrls.some(url => req.url.includes(url))) {
      return next(req);
    }
    const router = inject(Router)
    console.log("request arrived");
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.navigate(['/login'])
      return EMPTY
    }
    const newRequest = req.clone({
      setHeaders: {Authorization: `Bearer ${localStorage.getItem('authToken')}`}
    })
    return next(newRequest);
  }
