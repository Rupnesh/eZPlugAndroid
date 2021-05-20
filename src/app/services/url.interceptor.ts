import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { from } from 'rxjs'
import { Plugins } from '@capacitor/core';
import { constString } from '../constString';
const { Storage } = Plugins;

/** Pass untouched request through to the next request handler. */
@Injectable()
export class UrlInterceptor implements HttpInterceptor {
  urlsToNotUse: Array<string>;
  constructor() {
    this.urlsToNotUse= [
      'User/Getfaqs',
      'SMS/SendOTP',
      'SMS/VerifyOTPAndLogin',
      'mobile-app-update/app-version.json',
      'config/app-shell.config.json',
    ];
    // Storage.set({ key: constString.OTP_SESSION, value: JSON.stringify({token:"rupneshsharma"}) });
  }

  intercept(req: HttpRequest<any>, next: HttpHandler):
    Observable<HttpEvent<any>> {
    // get API url depending on actual enviroment(prod, local etc)
    
    const api_url = environment.API_URL;
    const request_url = api_url + req.url;
    if (req.url.endsWith('.json')) return next.handle(req);
    if (this.isValidRequestForInterceptor(req.url)) {
      return from(this.handle(req, next))
    }  
    return next.handle(req)  
  }

  async handle(req: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const { value } = await Storage.get({ key: constString.OTP_SESSION });
    if(value) {
      const api_url = environment.API_URL;
      const request_url = api_url + req.url;
      const authReq = req.clone({
        url: request_url,
        setHeaders: {
          Authorization: `Bearer ${JSON.parse(value).accessToken.token}`
          // Authorization: `Bearer ${JSON.parse(value).token}`
        }
      })
      return next.handle(authReq).toPromise()
    }
    else {
      return next.handle(req).toPromise()
    }
  }

  private isValidRequestForInterceptor(requestUrl: string): boolean {
    let positionIndicator: string = 'api/';
    let position = requestUrl.indexOf(positionIndicator);
    if (position > 0) {
      let destination: string = requestUrl.substr(position + positionIndicator.length);
      for (let address of this.urlsToNotUse) {
        if (new RegExp(address).test(destination)) {
          return false;
        }
      }
    }
    return true;
  }
}