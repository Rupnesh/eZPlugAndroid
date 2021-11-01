import { Component, OnInit, Renderer2  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LocalNotifications} from '@capacitor/local-notifications'

import { DashBoardService } from '../../dashboard/dashboard.service';
import { constString } from '../../constString';

import { PopoverController, Platform, AlertController, ModalController} from '@ionic/angular';
import { LoaderService } from '../../services/loading.service'
import { AlertService } from '../../services/alert.service'
import { WalletPage } from '../../wallet/wallet.page'

import { CallNumber } from '@ionic-native/call-number/ngx';
import * as moment from 'moment';
import { WalletModal } from '../wallet-modal/wallet.page';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.page.html',
  styleUrls: ['./station-details.page.scss'],
})
export class StationDetailsPage implements OnInit {
  userID: any = "";
  connetorSelected: any = "C1";
  selectPricing: any = "full";

  valueSliderPrice: any = 1;
  valueSliderUnits: any = 1;
  valueSliderTime: any = 1;

  stationDetails: any = {}
  stationDetailsStorage: any = {}

  pricingOptions = ["full", "Price", "Unit", "Time"]

  btnUnlockLoader: any = false;
  btnLockBoxLoader: any = false;
  btnPlugBoxLoader: boolean;
  btnUnlock: any = false;
  btnPlugged: any = true;
  btnLock: any = true;
  btnStartCharge: any = true;

  estimatedData: any;
  estimatedLoader = false;
  estimatedFlag = false;
  backButtonSubscription:any
  routedFromNearby: any = false;
  subscription: any;
  btnLockBoxFlag: boolean;
  minimumBalance: any;
  walletBalance : string = '';
  maxSliderUnits: string = '';
  maxSliderTime : string = '';

  constructor(private activatedRoute: ActivatedRoute, public router: Router, private dashboardService: DashBoardService,
    public popoverController: PopoverController, public loaderService: LoaderService,public route: ActivatedRoute,
    private callNumber: CallNumber, public alertService: AlertService, private renderer: Renderer2, private platform: Platform,
    public alertController: AlertController, public modalController: ModalController
  ) {
  }

  isEmpty(obj) {
    return !Object.keys(obj).length;
  }
  // ngOnDestroy() {
  //   this.backButtonSubscription.unsubscribe();
  // }


  async ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      if (this.router.url === '/app/station-details') {
        if(this.routedFromNearby) {
          if(this.btnLockBoxFlag) {
            this.presentAlert('Do you want to end this session?','app/search-near-by' )
          }
          else {
            this.router.navigate(['app/search-near-by'])
          }
        }
        else {
          if(this.btnLockBoxFlag) {
            this.presentAlert('Do you want to end this session?','app/dashboard' )
          }
          else {
            this.router.navigate(['app/dashboard'])
          }
        }
      }
        
    })    
    this.dashboardService.getObject(constString.OTP_SESSION).then(data => {
      this.userID = data.user.userId;
    })
    let tempUser = await this.dashboardService.getObject(constString.OTP_SESSION)
    this.userID = tempUser.user.userId;
 
    this.stationDetailsStorage = await this.dashboardService.getObject(constString.STATION_DETAILS)
    this.walletBalance         = await this.dashboardService.getItem1(constString.WALLET_BALANCE)
    this.loadStationDetails();
    this.dashboardService.checkMinimumWalletBalanceMaintained().subscribe(data => {
      this.minimumBalance = data;
    })
  }

  async presentAlert(msg, route) {
		const alert = await this.alertController.create({
      header: 'Warning!',
      message: msg,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Okay',
          handler: () => {
            this.unlockBox('abort',route)
          }
        }
      ]
    });

    await alert.present();
	}

  async ngOnInit() {
    
    if(this.router.getCurrentNavigation().extras.state) {
      this.router.getCurrentNavigation().extras.state.nearby ? this.routedFromNearby = true : this.routedFromNearby = false
    }
    this.walletBalance         = await this.dashboardService.getItem(constString.WALLET_BALANCE)
    // let tempUser = await this.dashboardService.getObject(constString.OTP_SESSION)
    // this.userID = tempUser.user.userId;
    // this.stationDetailsStorage = await this.dashboardService.getObject(constString.STATION_DETAILS)
    // this.loadStationDetails();
     
  }
  async loadStationDetails() {
    let userLocation = await this.dashboardService.getObject(constString.USER_LOCATION);
    if (userLocation == null) {
      userLocation = { "Lattitude": 0, "Longitude": 0 } 
    }
    this.loaderService.showLoader('Loading...');
    this.dashboardService.getStationDetails(this.stationDetailsStorage.stationId, userLocation, this.userID).subscribe(data => {
      if (data.hasError === false) {
        
        this.stationDetails = data;
        this.loaderService.hideLoader();
        this.dashboardService.setObject(data, constString.STATION_DETAILS_INFO)

        if(!data.isConnectedToIoTHub) {
          this.alertService.presentToast(constString.STATION_AVAILABILITY_MESSAGE)
        }
      }
      else {
        this.btnUnlockLoader = false;
        this.loaderService.hideLoader();
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.btnUnlockLoader = false;
      this.loaderService.hideLoader();
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    }) 
  }

  radioGroupChange(type) {
    this.connetorSelected = type;
  }

  radioPriceChange(type) {
    this.selectPricing = type;
    let price, timeInHours, units
    if (this.selectPricing === "full") {
      price = 0; timeInHours = 0; units = this.valueSliderUnits;
      // price = 0; timeInHours = 0; units = 0;
      this.getEstimateData("Unit", price, timeInHours, units);
      // this.getEstimateData("Auto", price, timeInHours, units);
    }
    if (this.selectPricing === "Price") {
      price = this.valueSliderPrice; timeInHours = 0; units = 0;
      this.getEstimateData("Price", price, timeInHours, units);
    }
    if (this.selectPricing === "Time") {
      timeInHours = this.valueSliderTime; price = 0; units = 0;
      this.getEstimateData("Time", price, timeInHours, units);
    }
    if (this.selectPricing === "Unit") {
      units = this.valueSliderUnits; price = 0; timeInHours = 0;
      this.getEstimateData("Unit", price, timeInHours, units);
    }
  }

  rangeChange(range: Range) {
  }

  onProgressChangeEnd() {
    let price, timeInHours, units
    if (this.selectPricing === "Price") {
      price = this.valueSliderPrice; timeInHours = 0; units = 0;
      this.getEstimateData("Price", price, timeInHours, units);
    }
    if (this.selectPricing === "Time") {
      timeInHours = this.valueSliderTime; price = 0; units = 0;
      this.getEstimateData("Time", price, timeInHours, units);
    }
    if (this.selectPricing === "Unit") {
      units = this.valueSliderUnits; price = 0; timeInHours = 0;
      this.getEstimateData("Unit", price, timeInHours, units);
    }
  }

  convertToTimeFormat(time: any) {
    return moment().startOf('day').seconds(time).format('HH:mm:ss')
    // return moment().startOf('day').seconds((time * 3600)).format('HH:mm:ss')
  }
  returnNumber(number) {
    if (number === null)
      return 0.000
    return parseFloat(number).toFixed(3)
  }
  returnNumberPrice(number) {
    if (number === null)
      return 0.00
    return parseFloat(number).toFixed(2)
  }

  async localNotification(time) {
    let endTime = moment(moment.now()).add(time * 60, 'minutes').format();
    const notifs = await LocalNotifications.schedule({
      notifications: [
        {
          title: "eZCharge Notification",
          body: "Estimated time reached",
          id: 1,
          schedule: { at: moment(endTime, moment.defaultFormat).toDate() },
          attachments: [
            { id: 'face', url: 'http://placekitten.com/g/300/20', options: {} }
          ],
          actionTypeId: "",
          extra: null
        }
      ]
    });
  }

  async getEstimateData(type, price, timeInHours, units) {
    this.estimatedLoader = true;

    let stationPrice    = await this.dashboardService.getItem(constString.PRICING_DETAILS);
    this.walletBalance  = await this.dashboardService.getItem(constString.WALLET_BALANCE)
    let stationInfo     = await this.dashboardService.getObject(constString.STATION_DETAILS_INFO)
    if(!stationPrice) {
      stationPrice = stationInfo.pricingDetails;
    }
    let dataObj = { "stationId": this.stationDetailsStorage.stationId, "chargingOption": type, "perUnitPrice":stationPrice, "price": price, "timeSpentCharging": timeInHours * 60, "units": units, "walletBalance": this.walletBalance ? this.walletBalance : 0 }
    // let dataObj = { "stationId": this.stationDetailsStorage.stationId, "chargingOption": type, "price": price, "timeInHours": timeInHours / 60, "units": units }
    this.dashboardService.calculateTransactionEstimate(dataObj).subscribe(data => {
      if (data.hasError === false) {
        this.estimatedFlag = true;
        this.estimatedData = data;
        this.maxSliderUnits = `${data.maxUnitsAvailableForCharging}`;
        this.maxSliderTime  = `${(data.maxTimeAvailbaleForCharging/60).toFixed(0)}`;
        this.dashboardService.setObject(data, constString.ESTIMATED_DATA)
        this.estimatedLoader = false;

        let dataObjNotify = {
          "messageId": "DataTransferRequest", "deviceId": this.stationDetailsStorage.stationName, "userId": this.userID,
          "operationId": "NotifyChargingDetailsRequest", "chargingOption": type, "price": data.estimatedCost, "timeInSeconds": data.timeTaken, "units": this.selectPricing === "full" ? data.maxUnitsAvailableForCharging : data.unitsConsumed, "pricingRate": stationPrice, "maxUnitsAvailableForCharging": data.maxUnitsAvailableForCharging
        }
        // let dataObjNotify = {
        //   "messageId": "DataTransferRequest", "deviceId": this.stationDetailsStorage.stationName, "userId": this.userID,
        //   "operationId": "NotifyChargingDetailsRequest", "chargingOption": type, "price": data.estimatedCost, "timeInSeconds": data.timeTaken, "units": data.unitsConsumed, "pricingRate": stationPrice, "maxUnitsAvailableForCharging": data.maxUnitsAvailableForCharging
        // }
        this.dashboardService.notifyChargingDetailsRequest(dataObjNotify).subscribe(data => {
        })

      }
    }, (error: any) => {
      this.estimatedLoader = false;
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })

  }

  proceed() {
    this.router.navigate(['app/charge'])
  }

  unlockBox(type, route) {
    let dataObj = {
      "messageId": "DataTransferRequest",
      "deviceId": this.stationDetailsStorage.stationName,
      "userId": this.userID,
      "operationId": 0
    }

    this.dashboardService.unLockDevice(dataObj).subscribe(data => {

      if (data.hasError === false) {
        this.btnUnlock = true;
        this.btnPlugged = false;
        this.btnLock = true;
        this.btnStartCharge = true;
        this.btnUnlockLoader = false;
        if(type == 'abort')
          this.router.navigate([route])
      }
      else {
        this.btnUnlockLoader = false;
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.btnUnlockLoader = false;
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })
  }

  boxSteps(type) {
    if (type === "unlock") {
      this.btnUnlockLoader = true;

      this.unlockBox('','')


    }
    if (type === "plugged") {

      // this.btnPlugBoxLoader = true;
      let dataObj = {
        "stationID": this.stationDetailsStorage.stationId,
        "connectorNumber": 1
      }

      this.btnUnlock = true;
      this.btnPlugged = true;
      this.btnLock = false;
      this.btnStartCharge = true;
      this.btnPlugBoxLoader = false;
      this.dashboardService.setItem(moment.now().toString(),constString.PLUGGEDIN_START_TIME)

      // this.dashboardService.getStationConnectorStatus(dataObj).subscribe(data => {

      //   if (data.hasError === false) {
      //     if (data.connectorStatus === "Occupied") {
      //       this.btnUnlock = true;
      //       this.btnPlugged = true;
      //       this.btnLock = false;
      //       this.btnStartCharge = true;
      //       this.btnPlugBoxLoader = false;
      //       this.dashboardService.setItem(moment.now().toString(),constString.PLUGGEDIN_START_TIME)
      //     }
      //     else {
      //       this.btnPlugBoxLoader = false;
      //       this.alertService.presentToast("Please check the box, and plug the cable.")
      //     }
      //   }
      //   else {
      //     this.btnPlugBoxLoader = false;
      //     this.alertService.presentToast(data.errorDescription)
      //   }
      // }, (error: any) => {
      //   this.btnLockBoxLoader = false;
      //   this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
      // })
    }
    if (type === "lock") {
      this.btnLockBoxLoader = true;
      this.btnLockBoxFlag = true;
      let dataObj = {
        "messageId": "DataTransferRequest",
        "deviceId": this.stationDetailsStorage.stationName,
        "userId": this.userID,
        "operationId": "DoorStatusRequest"
      }

      this.dashboardService.lockStatusOfDevice(dataObj).subscribe(data => {

        if (data.hasError === false) {
          if (data.response.data.doorStatus === "Locked") {
            this.btnUnlock = true;
            this.btnPlugged = true;
            this.btnLock = true;
            this.btnStartCharge = false;
            this.btnLockBoxLoader = false
          }
          else if (data.response.data.doorStatus === "Unlocked") {
            this.btnLockBoxLoader = false;
            this.alertService.presentToast("Please check the box, and lock the door.")
          }
        }
        else {
          this.btnLockBoxLoader = false;
          this.alertService.presentToast(data.errorDescription)
        }
      }, (error: any) => {
        this.btnLockBoxLoader = false;
        this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
      })

    }
    if (type === "charge") {
      let optionVal = this.selectPricing === "full" ? "Auto" : this.selectPricing
      let price = 0, timeInHours = 0, units = 0;
      if (this.selectPricing === "Price") { price = this.valueSliderPrice, timeInHours = 0, units = 0 }
      if (this.selectPricing === "Unit") { units = this.valueSliderUnits, price = 0, timeInHours = 0 }
      if (this.selectPricing === "Time") { timeInHours = this.valueSliderTime / 60, price = 0, units = 0 }
      let chargingOptions = { chargingOption: optionVal, price, timeInHours, units }
      this.dashboardService.setObject(chargingOptions, constString.SELECTED_CHARGING_OPTIONS)
      this.dashboardService.setItem('true', constString.IS_CHARGING_ENABLED)
      this.router.navigate(['app/charge'],{replaceUrl:true})
    }

  }


  callStation(number) {
    this.callNumber.callNumber(number, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => {
        this.alertService.presentToast(err)
      });
  }

  markAsFavourite() {
    let serverData = {"userId": this.userID, "stationId": this.stationDetailsStorage.stationId, 
      "stationName": this.stationDetailsStorage.stationName,"connectorNumber": 1}
    this.dashboardService.addStationToFavourite(serverData).subscribe(data => {
      if (data.hasError === false) {
        
        this.loadStationDetails();
        if(this.stationDetails.isMarkedAsFavourite) {
          this.alertService.presentToast("Removed from favourite")
        }
        else {
          this.alertService.presentToast("Marked as favourite")
        }
      }
    }, (error: any) => {
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })
  }

  async showWalletModal() {
    const modal = await this.modalController.create({
      component: WalletModal,
      cssClass: 'my-custom-modal-css-wallet',
      backdropDismiss: true,
    });
    return await modal.present();
  }

}
