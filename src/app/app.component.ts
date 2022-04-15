import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
// import { Platform } from '@ionic/angular';
import { Platform, IonRouterOutlet, AlertController } from '@ionic/angular';

import { Storage } from '@capacitor/storage';
import { Device } from '@capacitor/device';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar } from '@capacitor/status-bar';
import { LocalNotifications } from '@capacitor/local-notifications';

import { TranslateService } from '@ngx-translate/core';

import { Router, RouterEvent } from '@angular/router'
import { StorageService } from './services/storage.service'
import { UpdateService } from './services/update.service'
import { AlertService } from './services/alert.service'

import { DashBoardService } from '../app/dashboard/dashboard.service'
import { constString } from './constString';
import * as moment from 'moment';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';
import { SignalRService } from './services/signalr.service';
import { OneSignal } from '@ionic-native/onesignal/ngx'

import { ActiveTransactionForUser } from "./interfaces/activetransaction"
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: [
    './side-menu/styles/side-menu.scss',
    './side-menu/styles/side-menu.shell.scss',
    './side-menu/styles/side-menu.responsive.scss'
  ]
})
export class AppComponent implements OnInit {
  activePath: any = "/app";
  appPages = [
    {
      title: 'Home',
      url: '/app/dashboard',
      icon: 'home-outline'
    },
    {
      title: 'Profile',
      url: '/user',
      icon: 'person-outline'
    },
    {
      title: 'My Wallet',
      url: '/wallet',
      icon: 'wallet-outline'
    },
    {
      title: 'My Transactions',
      url: '/transaction',
      icon: 'card-outline'
    },
    {
      title: 'Help & Support',
      url: '/help',
      icon: 'help-circle-outline'
    },
    {
      title: 'About',
      url: '/about',
      icon: 'information-circle-outline'
    }
  ];


  textDir = 'ltr';
  userDetails: any;

  info: any = [];
  tutorialStatus: any;
  loginStatus: any;
  private lastBack = Date.now();
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;

  constructor(public translate: TranslateService,
    private router: Router,
    public storage: StorageService,
    public updateService: UpdateService,
    private dashboardService: DashBoardService,
    public platform: Platform,
    public alertController: AlertController,
    private smsRetriever: SmsRetriever,
    public signalRService: SignalRService,
    private oneSignal: OneSignal,
    private alertService: AlertService,
    private iab: InAppBrowser,
    private auth: AuthService
  ) {
    this.initializeApp();
    this.setLanguage();
    this.backButtonEvent();

    this.platform.ready().then(() => {
      this.updateService.checkForUpdate()
    })

    this.router.events.subscribe((event: RouterEvent) => {
      this.activePath = event.url
      this.menuClicked('/app/dashboard')
    })
    
  }
  menuClicked(p) {
    this.router.events.subscribe((event: RouterEvent) => {
      this.activePath = event.url
    })
  }
  ngOnInit(): void {
    
  }
  // public async tokenValidity() {
  //   let user = await this.storage.getObject(constString.OTP_SESSION)
  //   console.log(user)
  //   var now = new Date().getTime();
  //   var expiryDate = moment(user.accessToken.expiration).unix();
  //   if (expiryDate > now) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  tokenValidity = async () => {
    let user = await this.storage.getObject(constString.OTP_SESSION)
    var now = new Date().getTime();
    if (user) {
      var expiryDate = moment(user.accessToken.expiration).unix();
      if (expiryDate > now) {
        return true;
      } else {
        return false;
      }
    }

  }

  backButtonEvent() {
    this.platform.backButton.subscribe(() => {
      var timePeriodToExit = 2000;
      this.routerOutlets.forEach((outlet: IonRouterOutlet) => {
        if (this.router.url === '/app' || this.router.url === '/app/dashboard') {
          // this.presentAlertConfirm('Are you sure you want to exit the app?');
          if(Date.now() - this.lastBack < timePeriodToExit) {
            navigator['app'].exitApp();
          }
          else {
            this.alertService.presentToast('Press back again to exit.')
            this.lastBack= Date.now();
          }
        } 
        // else if (this.router.url === "/app/bill") {
          // this.presentAlertConfirm('Please make the payment!');
          // document.addEventListener('backbutton', function (event) {
          //   event.preventDefault();
          //   event.stopPropagation();
          // }, false);
        // } 
        else if (this.router.url === "/app/charge") {
          navigator['app'].exitApp();
        } else if(this.router.url === '/about' || this.router.url === '/help' || this.router.url === '/app/user' || this.router.url === '/transaction') {
          this.router.navigate(['app/dashboard'])
          
        }
        // else {
        //   console.log("in else......",this.router.url)
        //   window.history.back();
        // }
        if (this.router.url === '/auth/login') {
          navigator['app'].exitApp();
        }
      });
    });
  }
  async presentAlertConfirm(msg) {
    const alert = await this.alertController.create({
      message: msg,
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => { }
      }, {
        text: 'Close',
        handler: () => {
          navigator['app'].exitApp();
        }
      }]
    });
    await alert.present();
  }

  // async getCurrentPosition() {
  //   const coordinates = await Geolocation.getCurrentPosition();
  //   return coordinates
  // }

  async localNotification(userData) {
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: `Demo Nootification ${userData}`,
          body: "Hello",
          id: 1,
          schedule: { at: new Date(Date.now() + 1000 * 5) },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }

  async initializeApp() {
    
    try {

      if (this.platform.is('cordova')) {
        await SplashScreen.hide();
        await StatusBar.setBackgroundColor({ color: '#216581' });
        this.setupPush();
        this.smsRetriever.getAppHash().then((res: any) => console.log("sms app hask key...", res))
          .catch((error: any) => console.error(error));
      }
      
      
      this.info = await Device.getInfo();
      let tokenExpired = await this.tokenValidity();
      this.userDetails = await this.storage.getObject(constString.OTP_SESSION);
      this.tutorialStatus = await this.storage.getItem(constString.TUTORIAL_COMPLETED);
      this.loginStatus = await this.storage.getItem(constString.LOGIN_STATUS);
      let transactionStatus = await this.storage.getItem(constString.TRANSACTION_ID);

      
      if (tokenExpired === false) {
        this.dashboardService.getWalletBalance().subscribe(data => {
          if (data.hasError === false) {
            this.dashboardService.setItem1(constString.WALLET_BALANCE, data.walletBalance.toString())
          }
        });
        this.dashboardService.getActiveTransactionForUser().subscribe(async (data: ActiveTransactionForUser) => {
          if(data.hasError == false) {
            let userLocation = { "Lattitude": 0, "Longitude": 0 } 
            let stationDetailsInfo = await this.dashboardService.getObject(constString.STATION_DETAILS_INFO)
            if(!stationDetailsInfo) {
              this.dashboardService.getStationDetails(data.stationId, userLocation, null).subscribe(data => {
                this.dashboardService.setObject(data, constString.STATION_DETAILS_INFO)
                this.setRoute(data)
              })
            }
            else 
            this.setRoute(data)
          }
        }, (error: any) => {
          if (error.status === 400) {
            Storage.remove({ key: constString.TRANSACTION_ID }); 
            Storage.remove({ key: constString.CHARGING_START_TIME }); 
            // this.router.navigate(['app/dashboard']);

            if (this.loginStatus === "true") {
              this.router.navigate(['app/dashboard']);
            }
            else if (this.loginStatus === "false") {
              this.router.navigate(['/auth/login']);
            }

          }
          
        })

      
      }
      else {
        if (tokenExpired != undefined) {
          let refreshToken = this.userDetails.accessToken.refreshToken;
          let userId = this.userDetails.user.userId;
          this.auth.refreshToken({refreshToken, userId}).subscribe(data => {
            this.storage.setObject(constString.OTP_SESSION, data)
          })
          let tokenExpired = await this.tokenValidity();
          if (tokenExpired != undefined) {
            const alert = await this.alertController.create({
              message: 'Invalid session!!! Login Again.',
              buttons: [{
                text: 'Okay',
                handler: () => {
                  this.storage.removeItem();
                  this.router.navigate(['auth/login']);
                }
              }]
            });
            await alert.present();
          }
        }
        else {
          if (this.tutorialStatus == "true" && this.loginStatus == null) {
            this.router.navigate(['auth/login']);
          }
          else if (this.tutorialStatus == null && this.loginStatus == null) {
            if (this.info.platform != 'web') {
              this.router.navigate(['walkthrough']);
            }
            else
              this.router.navigate(['auth/login']);
          }
        }
      }
    } catch (err) {
    }
  }


  async setRoute(data) {
    if (this.info.platform === 'web') {
      // if (transactionStatus == null) {
      if (data.transactionId == null) {
        if (this.loginStatus === "true") {
          this.router.navigate(['app/dashboard']);
        }
        else if (this.loginStatus === "false") {
          this.router.navigate(['/auth/login']);
        }
      }
      else {
        if(data.isInvoiceAvailable) {
          let queryParams = {transctionId: data.transactionId}
          this.router.navigate(['app/bill'], { queryParams} );
        }
        else {
          this.router.navigate(['app/charge']);
          this.dashboardService.removeItemName(constString.PAYMENT_ORDER_DATA)
        }
      }
    }
    else if (this.info.platform === "android" || this.info.platform === "ios" ) {
      await StatusBar.setBackgroundColor({ color: '#216581' });
      // if (transactionStatus == null) {
      if (data.transactionId == null) {
        if (this.tutorialStatus == "true" && this.loginStatus == "true") {
          this.router.navigate(['app/dashboard']);
        }
        else if (this.tutorialStatus == "true" && this.loginStatus == "false") {
          this.router.navigate(['auth/login']);
        }
      }
      else {
        // this.router.navigate(['app/charge']);
        if(data.isInvoiceAvailable) {
          this.dashboardService.setItem(data.transactionId, constString.TRANSACTION_ID)
          this.dashboardService.setItem(data.orderId, constString.ORDER_ID)
          let queryParams = {transctionId: data.transactionId}
          this.router.navigate(['app/bill'], { queryParams} );
        }
        else {
          this.router.navigate(['app/charge']);
        }
      }
    }
  }

  setupPush() {
    this.oneSignal.startInit('0ae7083c-4069-416b-8271-be820b75e325', '662324969905');
    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe(data => {
    });

    this.oneSignal.handleNotificationOpened().subscribe(data => {
    });
 
    this.oneSignal.endInit();

    this.oneSignal.getIds().then((id) => {
    });

  }

  async setLanguage() {
    this.translate.setDefaultLang('en');
    let lang = await this.dashboardService.getItem1(constString.USER_LANGUAGE)
    if(lang)
      this.translate.use(lang);
    else
      this.translate.use('en');
  }

  logoutUser() {
    this.storage.removeItem().then(data => {
      this.router.navigate(['auth/login'])
    });
  }

  openWebsite() {
    const browser = this.iab.create('https://www.ztric.com', '_blank');
  }

}

