import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../../dashboard/dashboard.service';
import { constString } from '../../constString';
import { LoaderService } from '../../services/loading.service'
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';


import { ToastController, ModalController, Platform } from '@ionic/angular';
import { Location } from '@angular/common';

import { AlertService } from '../../services/alert.service'
import { SignalRService } from '../../services/signalr.service'

import { PaymentStatusModal } from '../payment-status-modal/payment-status-modal'; 


@Component({
  selector: 'app-bill',
  templateUrl: './bill.page.html',
  styleUrls: ['./bill.page.scss'],
})
export class BillPage implements OnInit {
  time: any = "00:00:00";
  kwh: any = 0;
  cost: any = 0;
  price: any = "";
  paymentLink: any = "";
  orderId: any = "";
  userID: any;
  pluggedInTime: any;
  totalTime: any;

  transactionStatusID: any;
  transactionStatus: any;

  invoiceData: any;
  paymentOrder: any;
  paymentOrderStatus: any;
  paymentButtonCreateOrderLoader = false;
  transactionID: string;
  stationDetailsStorage: any;
  energyConsumed_Time:any;
  constructor(private dashboardService: DashBoardService,
    private loaderService: LoaderService,
    public route: ActivatedRoute,
    public router: Router,
    public toastController: ToastController,
    private modalController: ModalController,
    private location: Location,
    private iab: InAppBrowser,
    public signalRService: SignalRService,
    private alertService: AlertService,
    private platform: Platform) { }

  async ngOnInit() {

    

    this.dashboardService.getItem(constString.PRICING_DETAILS).then(data => {
      this.price = data;
    })
    this.price = await this.dashboardService.getItem(constString.PRICING_DETAILS);
    let objUserSession = await this.dashboardService.getObject(constString.OTP_SESSION);
    this.userID = objUserSession.user.userId;
    this.pluggedInTime = await this.dashboardService.getItem(constString.PLUGGEDIN_START_TIME)
    this.dashboardService.getObject(constString.CHARGING_TRANSACTION_DATA).then(data => {
      this.transactionStatus = data;
      // this.kwh = this.transactionStatus.kwh;
      this.time = this.transactionStatus.time
      // this.cost = this.transactionStatus.cost
      this.paymentLink = this.transactionStatus.paymentLink
      this.orderId = this.transactionStatus.orderId
      this.transactionStatusID = this.transactionStatus.tid
      // this.generateInvoice();
    })

  }


  async ionViewDidEnter() { 

    this.platform.backButton.subscribeWithPriority(9999, () => {
      document.addEventListener('backbutton', function (event) {
        this.alertService.presentToast("Please make the payment")
        event.preventDefault();
        event.stopPropagation();
      }, false);
    });

    this.dashboardService.getItem(constString.PRICING_DETAILS).then(data => {
      this.price = data;
    })
    this.price = await this.dashboardService.getItem(constString.PRICING_DETAILS);

    this.route.queryParams.subscribe(async params => {
      if (params.transctionId) {
        this.dashboardService.getInvoiceDetailsForTransaction(params.transctionId).subscribe(data => {
          this.kwh = data.units;
          this.cost = data.grandTotal;
          this.energyConsumed_Time = data.timeSpentCharging
          this.invoiceData = data
        })
      }
      else {
        console.log("else calllllleddd...")
  
        this.transactionID = await this.dashboardService.getItem(constString.TRANSACTION_ID)
        this.stationDetailsStorage = await this.dashboardService.getObject(constString.STATION_DETAILS)
        let dataObj = { "transactionId": this.transactionID, "stationName": this.stationDetailsStorage.stationName, "connectorId": 1 }
        this.dashboardService.energyConsumedDetails(dataObj).subscribe(data => {
          this.kwh = data.energyConsumed;
          this.cost = parseFloat(this.kwh) * parseFloat(this.price);
          this.energyConsumed_Time = data.timeSpentCharging
          // this.time = data.timeSpentCharging;
          this.transactionStatusID = data.transactionId;
          this.generateInvoice();
        })
      }
    });
    
    
    

    // this.dashboardService.getObject(constString.CHARGING_TRANSACTION_DATA).then(data => {
    //   this.transactionStatus = data;
    //   this.kwh = this.transactionStatus.kwh;
    //   this.time = this.transactionStatus.time
    //   this.cost = this.transactionStatus.cost
    //   this.transactionStatusID = this.transactionStatus.tid
    //   this.generateInvoice();
    // })
  }

  async generateInvoice() {
    // this.loaderService.showLoader('Loading...');
    let stationinfo = await this.dashboardService.getObject(constString.STATION_DETAILS)
    let stationDetailsInfo = await this.dashboardService.getObject(constString.STATION_DETAILS_INFO)
    let chargingOptionsInfo = await this.dashboardService.getObject(constString.SELECTED_CHARGING_OPTIONS)
    let dataObj = {}
    let signalUnitsData;

    let currentTime: any = moment.now();
    if (this.pluggedInTime && currentTime) {
      var diffTime = currentTime - this.pluggedInTime;
      this.totalTime = diffTime / 1000
    }

    this.loaderService.showLoader("Generating invoice...");
    // this.signalRService.getUnitsConsumed().subscribe(data => {


    dataObj = {
      "siteId": stationDetailsInfo.siteID, "stationId": stationinfo.stationId, "transactionId": this.transactionStatusID,
      "userId": this.userID, "chargingOption": chargingOptionsInfo.chargingOption, "perUnitPrice": stationDetailsInfo.pricingDetails, "price": this.cost,
      "timeSpentCharging": this.time, "units": this.kwh, "TotalTransactionTime": this.totalTime
    }
    // dataObj = {
    //   "siteId": stationDetailsInfo.siteID, "stationId": stationinfo.stationId, "transactionId": this.transactionStatusID,
    //   "userId": this.userID,"chargingOption": chargingOptionsInfo.chargingOption, "price": this.cost,
    //   "timeInHours": this.time / 3600, "units": this.kwh, "TotalTransactionTime": this.totalTime
    // }

    this.signalRService.stopTransaction();
    this.dashboardService.generateInvoice(dataObj).subscribe(data => {
      if (data.hasError === false) {

        this.invoiceData = data
        // this.time = moment().startOf('day').hours((data.timeSpentCharging)).format('HH:mm:ss')
        this.loaderService.hideLoader();
        // this.createPaymentOrder()

      }
      else {
        this.loaderService.hideLoader();
      }
    }, (error: any) => {
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
      this.loaderService.hideLoader();
    })

    // })

  }
  convertToTimeFormat(time: any) {

    // let converted: any = time * 60 * 60;
    return moment().startOf('day').seconds((time)).format('HH:mm:ss')
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
  createPaymentOrder() {
    this.paymentButtonCreateOrderLoader = true;
    let dataObj = { "transactionId": this.transactionStatusID, "transactionAmount": parseInt(this.invoiceData.grandTotal) }
    this.dashboardService.paymentCreateOrder(dataObj).subscribe(data => {
      if (data.hasError === false) {
        this.paymentOrder = data
        this.paymentLink = data.paymentLink
        this.orderId = data.orderId;
        this.paymentButtonCreateOrderLoader = false;
      }
      else {
        this.paymentButtonCreateOrderLoader = false;
      }
    }, (error: any) => {
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
      this.paymentButtonCreateOrderLoader = false;
    })
  }

  async makePayment() {

    this.paymentButtonCreateOrderLoader = true;
    let dataObj = { "transactionId": this.transactionStatusID, "transactionAmount": this.invoiceData.grandTotal }

    let previousOrderStatus = await this.dashboardService.getObject(constString.PAYMENT_ORDER_DATA)
    if (previousOrderStatus !== null) {
      this.paymentLink = previousOrderStatus.paymentLink
      this.openPaymentInApp();
    }
    else {

      this.dashboardService.paymentCreateOrder(dataObj).subscribe(data => {
        if (data.hasError === false) {
          this.dashboardService.setObject(data, constString.PAYMENT_ORDER_DATA)
          this.paymentOrder = data
          this.paymentLink = data.paymentLink
          this.orderId = data.orderId;
          this.paymentButtonCreateOrderLoader = false;

          this.openPaymentInApp();

        }
        else {
          this.paymentButtonCreateOrderLoader = false;
        }
      }, (error: any) => {
        this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
        this.paymentButtonCreateOrderLoader = false;
      })

    }
  }

  openPaymentInApp() {
    const options: InAppBrowserOptions = { hideurlbar: 'yes', location: 'yes', hidenavigationbuttons: 'yes' }
    const browser = this.iab.create(this.paymentLink, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      var closeUrlTest = 'https://test.cashfree.com/billpay/sim/thankyou';
      var closeUrlProd = 'https://www.cashfree.com/gateway/thankyou';
      if (event.url == closeUrlProd || event.url == closeUrlTest) {
        browser.close();
        this.loaderService.showLoader('Loading...');
        let dataObj = { orderId: this.orderId, transactionId: this.transactionStatusID }
        this.dashboardService.paymentOrderStatus(dataObj).subscribe(data => {
          if (data.hasError === false) {

            this.paymentOrderStatus = data;
            this.loaderService.hideLoader()
            this.presentModal();
          }
          else {
            this.loaderService.hideLoader()
          }
        }, (error: any) => {
          this.loaderService.hideLoader()
        })
      }
    });
  }

  async closeModal() {
    this.location.back();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: PaymentStatusModal,
      cssClass: 'my-custom-modal-css',
      componentProps: this.paymentOrderStatus
    });
    return await modal.present();
  }

}
