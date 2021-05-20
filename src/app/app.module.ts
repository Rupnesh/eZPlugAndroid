import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';


import { ServiceWorkerModule } from '@angular/service-worker';

import { environment } from '../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { StorageService } from './services/storage.service';
import { LoaderService } from './services/loading.service';
import { AlertService } from './services/alert.service';
import { UpdateService } from './services/update.service'

// import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { CallNumber } from '@ionic-native/call-number/ngx';
// import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { DashBoardService} from '../app/dashboard/dashboard.service'
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'

import { ComponentsModule } from './components/components.module';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';

import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { InterceptorService } from './services/interceptor.service';
import { UrlInterceptor } from './services/url.interceptor';
import { Market } from '@ionic-native/market/ngx';


export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    ReactiveFormsModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
    HttpClientModule,
    BrowserAnimationsModule,
    ComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    // NativeGeocoder,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UrlInterceptor, multi: true },
    StorageService, 
    LoaderService,
    AlertService,
    UpdateService,
    CallNumber,
    // BarcodeScanner,
    QRScanner,
    InAppBrowser,
    EmailComposer,
    AppVersion,
    AppRate,
    DashBoardService,
    SmsRetriever,
    InAppBrowser,
    OneSignal,
    AndroidPermissions,
    LocationAccuracy,
    Market
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}





// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { RouteReuseStrategy } from '@angular/router';

// import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';

// import { ComponentsModule } from './components/components.module';

// import { ServiceWorkerModule } from '@angular/service-worker';

// import { environment } from '../environments/environment';
// import { ReactiveFormsModule } from '@angular/forms';

// import { HttpClientModule, HttpClient } from '@angular/common/http';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { QRScanner } from '@ionic-native/qr-scanner/ngx';



// export function createTranslateLoader(http: HttpClient) {
//   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// }

// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     IonicModule.forRoot(),
//     ReactiveFormsModule,
//     AppRoutingModule,
//     ComponentsModule,
//     ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
//     HttpClientModule,
//     TranslateModule.forRoot({
//       loader: {
//         provide: TranslateLoader,
//         useFactory: (createTranslateLoader),
//         deps: [HttpClient]
//       }
//     })
//   ],
//   providers: [
//     QRScanner,
//     { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule {}
