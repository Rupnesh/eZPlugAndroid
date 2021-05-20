import { Component, OnInit, AfterViewInit, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CallNumber } from '@ionic-native/call-number/ngx';
import { ModalController, Platform } from '@ionic/angular';
import { LoaderService } from '../../services/loading.service'
import * as moment from 'moment';
import { DashBoardService } from '../../dashboard/dashboard.service';
import { AlertService } from '../../services/alert.service'

import { constString } from '../../constString';
import { SignalRService } from '../../services/signalr.service'

import { Plugins } from '@capacitor/core';
const { LocalNotifications } = Plugins;

@Component({
  selector: 'app-charge',
  templateUrl: './charge.page.html',
  styleUrls: ['./charge.page.scss'],
})
export class ChargePage implements OnInit {
  stationDetails: any = [];
  stationDetailsStorage: any;

  charge: boolean = false;
  loaderMsg: string = ""

  time: any = "00:00:00";
  kwh: any = 0;
  cost: any = 0;

  transactionID: any;

  btnPayment: any = true;
  btnUnlock: any = true;
  btnUnlockLoader: any = false;
  btnPlugged: any = true;

  transactionStatus: any = false;
  stopRequest: any = true;

  userID: any = "";
  price: any = 0;

  chargingOptions: any;
  startInterval: any;
  interval: number = 1000;
  estimatedData: any;
  subscription: any;
  refreshLoaded: boolean;
  @ViewChild('refresh', {static: false}) refresh:ElementRef;
  stopClicked: string;

  constructor(public activatedRoute: ActivatedRoute, public router: Router, private callNumber: CallNumber,
    private loaderService: LoaderService,
    private dashboardService: DashBoardService,
    public modalController: ModalController,
    public alertService: AlertService,
    public signalRService: SignalRService,
    private platform: Platform,
    private renderer2: Renderer2
  ) {
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
  ngOnInit() {

  }

  async ionViewWillEnter() {

    window.clearInterval(this.startInterval)
    this.time = 0
    this.startInterval = null
    // this.interval = 1;
    // let eventTime: any = parseInt(await localStorage.getItem(constString.CHARGING_START_TIME))
    let eventTime: any = parseInt(await this.dashboardService.getItem(constString.CHARGING_START_TIME))
    let currentTime: any = moment.now();
    if (eventTime && currentTime) {
      var diffTime = currentTime - eventTime;
      this.time = diffTime / 1000
      this.startInterval = setInterval(() => {
        this.time = parseInt(this.time) + 1;
      }, this.interval)
    }

    let userData = await this.dashboardService.getObject(constString.OTP_SESSION);
    let signalConnaction = await this.signalRService.startConnection(userData);
    this.price = await this.dashboardService.getItem(constString.PRICING_DETAILS)
    this.stopClicked = await this.dashboardService.getItem(constString.STOP_CLICKED)
    
    this.stationDetails = await this.dashboardService.getObject(constString.STATION_DETAILS_INFO)
    if(!this.price) {
      this.price = this.stationDetails.pricingDetails;
    }
    this.stationDetailsStorage = await this.dashboardService.getObject(constString.STATION_DETAILS)

    this.refreshChargedData();
    
    this.chargingOptions = this.dashboardService.getObject(constString.SELECTED_CHARGING_OPTIONS)
    this.estimatedData = this.dashboardService.getObject(constString.ESTIMATED_DATA)

    if (this.chargingOptions == null) {
      this.chargingOptions = await this.dashboardService.getObject(constString.SELECTED_CHARGING_OPTIONS)
    }
    this.transactionData();
  }

  async refreshChargedData() {
    console.log("called.....")
    this.refreshLoaded = false
    this.renderer2.addClass(this.refresh.nativeElement,'spin')
    this.transactionID = await this.dashboardService.getItem(constString.TRANSACTION_ID)
    if(this.transactionID != null) {
      this.dashboardService.getItem(constString.TRANSACTION_ID).then(data => {
        if (data) {
          this.transactionStatus = true;

          this.charge = true;
          let dataObj = { "transactionId": this.transactionID, "stationName": this.stationDetailsStorage.stationName, "connectorId": 1 }
          this.dashboardService.energyConsumedDetails(dataObj).subscribe(data => {
            this.kwh = data.energyConsumed;
            this.cost = parseFloat(this.kwh) * parseFloat(this.price);
            this.time = data.timeSpentCharging
            this.refreshLoaded = true
            this.renderer2.removeClass(this.refresh.nativeElement,'spin')
          })

          setTimeout(() => {
            this.signalRService.notifyTransactionListener(this.stationDetailsStorage.stationName).subscribe(data => {
              this.transactionData = data;
              this.kwh = data.energyConsumed;
              this.cost = parseFloat(this.kwh) * parseFloat(this.price);
            })
          }, 15000)
        }
      })
    }
    else {
      let isEnabled = await this.dashboardService.getItem(constString.IS_CHARGING_ENABLED)
      console.log("🚀 ~ file: charge.page.ts ~ line 156 ~ ChargePage ~ refreshChargedData ~ isEnabled", isEnabled)
      
      if(!isEnabled)
        this.startCharging();
    }
  }

  async transactionData() {
    let userData = await this.dashboardService.getObject(constString.OTP_SESSION)
    this.userID = userData.user.userId;
  }

  callStation(number) {
    this.callNumber.callNumber(number, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => {
        this.alertService.presentToast(err)
      });
  }

  // async ionViewWillEnter() {
    

  // }

  convertToTimeFormat(time: any) {
    return moment().startOf('day').seconds((time)).format('HH:mm:ss')
  }
  async startCharging() {
    // this.startInterval = null
    // this.interval = 1;
    window.clearInterval(this.startInterval)
    this.loaderMsg = "Connecting to Station..."
    this.loaderService.showLoader(this.loaderMsg);

    let userData = await this.dashboardService.getObject(constString.OTP_SESSION)
    this.userID = userData.user.userId;

    let dataObjStart = {
      "messageId": "RequestStartTransactionRequest",
      "deviceId": this.stationDetailsStorage.stationName,
      "userId": this.userID,
      "stationId": this.stationDetailsStorage.stationId,
      "connectorNumber": 0
    }

    this.dashboardService.startCharging(dataObjStart).subscribe(data => {
      if (data.hasError === false) {
        // if (this.estimatedData)
        //   this.localNotification(this.estimatedData.timeTakenInHours)
        this.dashboardService.setItem("true", constString.IS_CHARGING_ENABLED)
        this.time = 0;
        this.dashboardService.setItem(moment.now().toString(), constString.CHARGING_START_TIME)
        this.startInterval = setInterval(() => {
          this.time = this.time + 1;
        }, this.interval)

        this.transactionStatus = true;
        this.loaderService.hideLoader()
        this.transactionID = data.response.transactionId;
        this.dashboardService.setItem(this.transactionID, constString.TRANSACTION_ID)

        let dataObjEnergy = { "transactionId": this.transactionID, "stationName": this.stationDetailsStorage.stationName, "connectorId": 0 }

        this.charge = true;
        if (this.transactionID) {

          this.signalRService.notifyTransactionListener(this.stationDetailsStorage.stationName).subscribe(data => {
            this.transactionData = data;
            this.kwh = data.energyConsumed;
            this.cost = parseFloat(this.kwh) * parseFloat(this.price);

            if (data.stoppedReason === "TimeLimitReached" || data.stoppedReason === "EnergyLimitReached") {
              this.stopCharging()
            }
          })

          // this.signalRService.notifyTransactionTimer(this.transactionID, this.siteStationData.stationData.stationName, 1).subscribe(data => {
          //   this.time = moment().startOf('day').seconds((data)).format('HH:mm:ss')
          // })
        }
      }
      else {
        this.btnUnlockLoader = false;
        this.loaderService.hideLoader()
        this.charge = false;
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.btnUnlockLoader = false;
      this.loaderService.hideLoader()
      this.charge = false;
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })
  }
  stopCharging() {
    this.dashboardService.getItem(constString.TRANSACTION_ID).then(data => {
      let tID = data;

      let dataObj = {
        "messageId": "RequestStopTransactionRequest",
        "deviceId": this.stationDetailsStorage.stationName,
        "userId": this.userID,
        "transactionId": tID
      }
      this.loaderMsg = "Stopping Seesion & Calculating Bill"
      this.loaderService.showLoader(this.loaderMsg);

      this.dashboardService.stopCharging(dataObj).subscribe(data => {
        if (data.hasError === false) {
          this.dashboardService.setItem(this.time.toString(), constString.PLUGGEDOUT_TIME)
          this.dashboardService.setItem("true", constString.STOP_CLICKED)

          this.dashboardService.removeItemName(constString.CHARGING_START_TIME)
          window.clearInterval(this.startInterval)

          this.loaderService.hideLoader();
          this.transactionStatus = false;
          this.stopRequest = false;
          this.btnUnlock = false;
          // this.dashboardService.removeItem();
          this.charge = false;

          let transactiondata = { "tid": this.transactionID, "kwh": this.kwh, "time": this.time, "cost": this.cost, ...this.chargingOptions }
          this.dashboardService.setObject(transactiondata, constString.CHARGING_TRANSACTION_DATA)
          this.router.navigate(['app/bill'])
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


    })
  }

  async boxSteps(type) {

    if (type === "unlock") {
      this.btnUnlockLoader = true;
      let dataObj = {
        "messageId": "DataTransferRequest",
        "deviceId": this.stationDetailsStorage.stationName,
        "userId": this.userID,
        "operationId": 0
      }

      this.dashboardService.unLockDevice(dataObj).subscribe(data => {
        if (data.hasError === false) {
          this.btnPayment = true;
          this.btnUnlock = true;
          this.btnPlugged = false;
          this.btnUnlockLoader = false;
          this.dashboardService.removeItemName(constString.IS_CHARGING_ENABLED)
          this.dashboardService.removeItemName(constString.STOP_CLICKED)
        }
        else {
          this.btnUnlockLoader = false;
          this.alertService.presentToast(data.errorDescription)
        }
      }, (error: any) => {
        this.btnUnlockLoader = false;
        this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
        this.dashboardService.removeItemName(constString.IS_CHARGING_ENABLED)
        this.dashboardService.removeItemName(constString.STOP_CLICKED)
      })
    }
    if (type === "plugged") {
      this.router.navigate(['app/dashboard']);
    }
  }

  returnNumber(number) {
    if (number === null)
      return 0.00
    return parseFloat(number).toFixed(2)
  }

  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.router.navigate(['app/station-details'])    
    })
  }


}
