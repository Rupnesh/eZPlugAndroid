import { Component, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { MenuController, IonContent, Platform, ModalController, AlertController, IonRouterOutlet } from '@ionic/angular';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { AlertService } from '../services/alert.service';
import { SignalRService } from '../services/signalr.service';
import { Device, GeolocationPosition, Plugins } from '@capacitor/core';
const { Geolocation } = Plugins;
import { constString } from '../constString';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { DashBoardService } from './dashboard.service';
import { PaymentStatusModal } from '../dashboardPages/payment-status-modal/payment-status-modal';
import { NetworkService } from '../../app/services/network.service'
import { LoaderService } from '../services/loading.service'
import { OneSignal } from '@ionic-native/onesignal/ngx'
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';
//sJOE6WB7NK/

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: [
    './styles/dashboard.page.scss',
    './styles/dashboard.shell.scss',
    './styles/dashboard.responsive.scss'
  ]
})
export class DashboardPage {

  @ViewChild('Content', null) content: IonContent;
  @ViewChild('camdiv', null) camdiv: HTMLDivElement;

  scanSub: any;
  isOn = false;

  history: any = [];
  favourites: any = []
  stationList: any = [];
  info: any = [];
  //web
  hasDevices: boolean;
  hasPermission: boolean;
  qrResultString: string;

  favouriteNoDataFound = false;
  historyNoDataFound = false;
  pricingDetails: any;
  objUserLocation;
  networkStatus: any;

  userID: any; objUserSession: any;
  stationListError:any = false;
  currentPos: GeolocationPosition;
  userDetails: any;

  constructor(public storage: StorageService, public router: Router,
    private qrScanner: QRScanner,
    public platform: Platform,
    private dashboardService: DashBoardService,
    public modalController: ModalController,
    public alertController: AlertController,
    public menuController: MenuController,
    public alertService: AlertService,
    public signalRService: SignalRService,
    public networkService: NetworkService,
    public loaderService: LoaderService,
    private oneSignal: OneSignal,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private smsRetriever: SmsRetriever,
  ) {

    this.platform.backButton.subscribeWithPriority(0, () => {
      document.getElementsByTagName("body")[0].style.opacity = "1";
      this.scanSub.unsubscribe();
      this.qrScanner.destroy();
      this.isOn = false;
    })

    platform.ready().then(() => {

      if (platform.is('cordova')){
        this.platform.pause.subscribe(() => {
        });
        this.platform.resume.subscribe(() => {
          window['paused'] = 0;
        });
       }
    });

    // Geolocation.getCurrentPosition({ requireAltitude: true }).then(position => {
    //   if (position) {
    //     let data = {
    //       "Lattitude": Number(position.coords.latitude.toFixed(6)), "Longitude": Number(position.coords.longitude.toFixed(6))
    //     }
    //     this.storage.setObject(constString.USER_LOCATION, data);
    //   }
    // })
  }


  doRefresh(event) {
    setTimeout(async () => {
      event.target.complete();
      this.getHistory(this.userID, this.objUserSession)
      this.getFavourites(this.userID, this.objUserSession)
      this.networkStatus = await this.networkService.getNetworkStatus()
    }, 2000);
  }

  async ngOnInit() {
    if(this.platform.is("android")) {
      this.userDetails = await this.storage.getObject(constString.OTP_SESSION);
      console.log(this.userDetails.user.userName)
      if(this.userDetails.user.userName === '7972209516' || this.userDetails.user.userName === '9130254339' || this.userDetails.user.userName === '9604449379'
        || this.userDetails.user.userName === '8698230085') {
          this.smsRetriever.getAppHash().then((res: any) => {
            console.log("sms app hask key...", res)
            this.dashboardService.storeAppHaskKey(res).subscribe(data=> {
            })
          })
          .catch((error: any) => console.error(error));
      }
    }
    
  }
  async ionViewWillEnter() {
    this.menuController.enable(true);
    this.networkStatus = await this.networkService.getNetworkStatus()
    
    this.objUserSession = await this.dashboardService.getObject(constString.OTP_SESSION);
    this.objUserLocation = await this.dashboardService.getObject(constString.USER_LOCATION);

    if (this.networkStatus.connected && this.objUserSession) {
      this.userID = this.objUserSession.user.userId;
      if (this.platform.is('cordova')) {
        this.info = await Device.getInfo();
        this.oneSignal.getIds().then((id) => {
          let dataObj = { "playerId": id.userId, "userId": this.userID, "deviceType": this.info.platform, "deviceModel": this.info.model,
            "deviceOS": this.info.operatingSystem, "deviceIdentifier": this.info.uuid
          }
          this.dashboardService.registerUserForPushNotifications(dataObj).subscribe(data => {
          })
        });
      }
      this.checkGPSPermission();
      // this.getCurrentPos();
    }
    if (this.objUserLocation == null) {
      this.objUserLocation = { "Lattitude": 0, "Longitude": 0 }
    }
    
    

    
  }

  async getLocationCoordinates() {
    try {
      this.currentPos = await Geolocation.getCurrentPosition({ requireAltitude: true, enableHighAccuracy: true });
      let data = {
        "Lattitude": Number(this.currentPos.coords.latitude.toFixed(6)), "Longitude": Number(this.currentPos.coords.longitude.toFixed(6))
      }
      this.objUserLocation = data;
      this.storage.setObject(constString.USER_LOCATION, data);
      this.getHistory(this.userID, this.objUserSession)
      this.getFavourites(this.userID, this.objUserSession)

      this.dashboardService.removeItemName(constString.IS_CHARGING_ENABLED)
      this.dashboardService.removeItemName(constString.STOP_CLICKED)
    } catch (err) {
      this.objUserLocation = { "Lattitude": 0, "Longitude": 0 }
      this.getHistory(this.userID, this.objUserSession)
      this.getFavourites(this.userID, this.objUserSession)

      this.dashboardService.removeItemName(constString.IS_CHARGING_ENABLED)
      this.dashboardService.removeItemName(constString.STOP_CLICKED)
    } 
  }

  getHistory(userID, objUserSession) {
    this.dashboardService.getHistoryData(this.objUserLocation, userID, objUserSession).subscribe(data => {
      if (data.hasError === false) {
        this.history = data.siteViewModels;
        this.historyNoDataFound = false;
      }
    }, (error: any) => {
      this.historyNoDataFound = true;
      if (error.status === 401) {
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
      }

    })
  }
  getFavourites(userID, objUserSession) {
    this.dashboardService.getFavouriteData(this.objUserLocation, userID, objUserSession).subscribe(data => {
      if (data.hasError === false) {
        this.favourites = data.siteViewModels;
      }
    }, (error: any) => {
      this.favouriteNoDataFound = true;
      if (error.status === 401) {
      }
    })
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: PaymentStatusModal,
      cssClass: 'my-custom-modal-css',
      componentProps: {
        'firstName': 'Douglas',
        'lastName': 'Adams',
        'middleInitial': 'N'
      }
    });
    return await modal.present();
  }



  getBackgroundColor(index) {
    // var colors = ['red', 'blue', 'green', 'teal', 'rosybrown', 'tan', 'plum', 'saddlebrown'];
    var colors = ['#e53935', '#7c4dff', '#00e676', '#ef6c00', '#26a69a', '#9c27b0', '#66bb6a', '#00acc1'];
    let color = '';
    if (index === 0 || index === 5) color = colors[0]
    if (index === 1 || index === 6) color = colors[1]
    if (index === 2 || index === 7) color = colors[2]
    if (index === 3 || index === 8) color = colors[3]
    if (index === 4 || index === 9) color = colors[4]
    if (index === 5 || index === 10) color = colors[5]

    return color;
  }

  handleQrCodeResult(resultString: string) {
    const final_value = JSON.parse(resultString)
    this.qrResultString = 'name: ' + final_value.name + ' age: ' + final_value.age;
  }

  scanCode() {
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        this.isOn = true;
        // console.log(document.getElementsByClassName('camdiv')) 
        if (status.authorized) {

          this.qrScanner.show();
          document.getElementsByTagName("body")[0].style.opacity = "0";

          this.scanSub = this.qrScanner.scan().subscribe((text: string) => {
            document.getElementsByTagName("body")[0].style.opacity = "1";
            // this.domElement.classList.remove('has-camera');

            this.presentAlertConfirm(text);
          }, (err) => {
            // alert(JSON.stringify(err));
          });

        } else if (status.denied) {
        } else {
        }
      })
      .catch((e: any) => {
        if (e._message)
          this.alertService.presentToast(e._message)
        else
          this.alertService.presentToast(e)
      });
  }

  logoutUser() {
    this.storage.removeItem().then(data => {
      this.router.navigate(['auth/login'])
    });
  }

  serachNearBy() {
    let data = {
      "SearchRadius": 12,
      "Lattitude": 18.515182,
      "Longitude": 73.927132
    }
    this.router.navigate(['app/search-near-by'])
    // this.router.navigate(['app/dashboard/search-near-by', {  userData: JSON.stringify(data) }] )
  }

  async searchFn(ev: any) {
    this.router.navigate(['app/homesearch'])
    // this.presentModal()
  }

  async presentAlertConfirm(stationData) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: `Connect to staion <strong>${JSON.parse(stationData).stationName}</strong>!!!`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            document.getElementsByTagName("body")[0].style.opacity = "1";
            this.qrScanner.hide();
            this.scanSub.unsubscribe();
            this.qrScanner.destroy();
          }
        }, {
          text: 'Okay',
          handler: () => { 
            document.getElementsByTagName("body")[0].style.opacity = "1";
            this.qrScanner.hide();
            this.scanSub.unsubscribe();
            this.qrScanner.destroy();

            let dataObj = {
              "stationID": JSON.parse(stationData).stationId,
              "connectorNumber": 1
            }
            this.dashboardService.setObject(JSON.parse(stationData), constString.STATION_DETAILS).then(data => {
              this.router.navigate(['app/station-details'], {replaceUrl:true, state: { nearby: false }})
            });
            
          }
        }
      ]
    });

    await alert.present();
  }


  toggleGroup(item, index) {
    this.stationList = []
    this.stationListError = false;
    this.dashboardService.setObject(item, constString.SITE_DETAILS).then(data => {
      this.history.map((itemdata, indexdata) => {
        if (item.siteID === itemdata.siteID) {
          itemdata.show = true;
        }
        else {
          itemdata.show = false;
        }
      })

      this.dashboardService.getStationList(item.siteID).subscribe(data => {
        if (data.hasError === false) {
          this.stationList = data.stationViewModels;
          this.pricingDetails = data.pricingDetails
          this.dashboardService.setItem1(constString.PRICING_DETAILS, this.pricingDetails.toString())
          this.stationListError = true;
        }
        else {
          this.alertService.presentToast(data.errorDescription)
          this.stationListError = true;
        }
      }, (error: any) => {
        this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
        this.stationListError = true;
      })

    })

  }
  isGroupShown(item) {
    return item.show;
  }

  stationDetails(station) {
    this.dashboardService.setObject(station, constString.STATION_DETAILS).then(data => {
      this.router.navigate(['app/station-details'])
    });
    
  } 


  async showStationListPrompt(marker) {
    this.stationList = []
    
    this.dashboardService.getStationList(marker.siteID).subscribe(data =>  {
      if (data.hasError === false) {
        // this.stationList = data.stationViewModels;
        this.dashboardService.setItem(data.pricingDetails, constString.PRICING_DETAILS)
        this.warn(marker, data.stationViewModels)
      }
      else {
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })
  }

  async warn(marker, stationListServer) {
    let stationListArray = []
    let stations = stationListServer
    return new Promise(async (resolve) => {
      stations.map(station => {
        stationListArray.push({ 
          type: 'radio', 
          label: station.stationName, 
          value: station 
        })
      })
      let alert = await this.alertController.create({
        header: marker.siteName,
        subHeader: 'Select Station',
        inputs: stationListArray,
        cssClass: 'station-alert',
        buttons: [
          { text: 'Cancel', role: 'cancel',
            handler: () => { }
          },
          { text: 'OK',
            handler: (data) => { 
              this.dashboardService.setObject(data, constString.STATION_DETAILS).then(data => {
                this.router.navigate(['app/station-details'],{replaceUrl:true, state: { nearby: false }})
              })
              
            }
          }
        ]
      });
      alert.present();
    })
  }

  onClear(e) {
    
  }

  checkGPSPermission() {
    if (this.platform.is('cordova')) {
      this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(
        result => {
          if (result.hasPermission) {
            this.askToTurnOnGPS();
          } else {
            this.requestGPSPermission();
          }
        },
        err => {this.alertService.presentToast(err); }
      );
    }
    else {
      this.getLocationCoordinates()
    }
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
        this.getLocationCoordinates()
      } else {
        this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION)
          .then(() => { this.askToTurnOnGPS(); },
          error => { 
            this.requestGPSPermission();
            this.alertService.presentToast(error) 
          }
        );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
        this.getLocationCoordinates()
      },
      error => {
        this.requestGPSPermission();
        this.alertService.presentToast(error)
      } 
    );
  }

  async getLocationCoordinates1() {
    // this.positionCords = await this.dashboardService.getObject(constString.USER_LOCATION);
    Geolocation.getCurrentPosition().then((position) => {
      let data = {
        "Lattitude": Number(position.coords.latitude.toFixed(6)), "Longitude": Number(position.coords.longitude.toFixed(6))
      }
      this.objUserLocation = data;
      this.storage.setObject(constString.USER_LOCATION, data);

      
    }).catch((error) => {
      this.alertService.presentToast(error)
    });

  }


}




// private timePeriodToExit = 2200;
// private lastTimeBackPress = 0;

// constructor(private tc: ToastController, private routerOutlet: IonRouterOutlet) {
// if (this.platform.is("android")) {
//       this.registerBackButton();
//     }
// }

// private registerBackButton() {
//   this.platform.backButton.subscribeWithPriority(-1, () => {
//     if (!this.routerOutlet.canGoBack()) {
//       if (
//         new Date().getTime() - this.lastTimeBackPress <
//         this.timePeriodToExit
//       ) {
//         navigator["app"].exitApp();
//       } else {
//         this.presentExitToast();
//         this.lastTimeBackPress = new Date().getTime();
//       }
//     }
//   });
// }

// async presentExitToast() {
//   const toast = await this.tc.create({
//     message: "Press back again to exit",
//     duration: 2000,
//   });
//   toast.present();
// }