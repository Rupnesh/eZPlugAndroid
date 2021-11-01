import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
// import { User, Role } from '../_models';
import { Observable, of, throwError, BehaviorSubject } from "rxjs";
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AlertService } from './alert.service';
import { constString } from '../constString';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor{
  private currentUserSubject: BehaviorSubject<any>;
  constructor(public router: Router, public alertService: AlertService,public storage: StorageService,) { 
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem(constString.LOGIN_STATUS)));
  }
    handleError(error: HttpErrorResponse){
    return throwError(error);
  }
  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>>{
    return next.handle(req).pipe(
      catchError((error) => {
        let handled: boolean = false;
        if (error instanceof HttpErrorResponse) {
          if (error.error instanceof ErrorEvent) {
          } else {
            // console.log(`error status : ${error.status} ${error.statusText}`);
            switch (error.status) {
              // case 401: 
              //   this.storage.removeItem().then(data => {
              //     this.currentUserSubject.next(null);
              //     this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
              //   });

              //   handled = true;
              //   break;
              // case 400:     //forbidden
              //   handled = true;
              //   break;
              case 403:     //forbidden
                handled = true;
                break;
            }
          }
        }
        else {
          // console.error("Other Errors");
        }
 
        if (handled) {
          return of(error);
        } else {
          return throwError(error);
        }
 
      })
    )


  };
}