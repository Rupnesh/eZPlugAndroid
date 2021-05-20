import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { constString } from '../constString';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { } 

    getOTP(mobile): Observable<any> {
        // return this.http.get<any>(`${constString.PATH_SMS}${constString.SEND_OTP}/${mobile}`);
        return this.http.get<any>(`${environment.API_URL}${constString.PATH_SMS}${constString.SEND_OTP}/${mobile}`);
    }

    verfiyOTP(data): Observable<any> {
        // return this.http.post<any>(`${constString.PATH_SMS}${constString.VERIFY_OTP}`, data);
        return this.http.post<any>(`${environment.API_URL}${constString.PATH_SMS}${constString.VERIFY_OTP}`, data);
    }

}