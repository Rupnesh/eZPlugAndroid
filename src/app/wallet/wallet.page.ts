import { Component, Input, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { constString } from '../constString';
import { DashBoardService } from '../dashboard/dashboard.service';
import { LoaderService } from '../services/loading.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  tagDefaultColor:any = [];
  priceTag:any = []
  amount:any;
  walletBalance       : any = [];
  minimumWalletBalance: any;
  walletBalanceLoader : boolean;
  amountError         : any = false;
  userID              : any;
  @Input() showMenu   : boolean;

  constructor(private dashboardService: DashBoardService, private iab: InAppBrowser,private loaderService: LoaderService) { 
    
  }

  async ngOnInit() {
      let userSesson = await this.dashboardService.getObject(constString.OTP_SESSION);
      this.tagDefaultColor = ["danger","dark", "dark", "dark"]
      this.priceTag = [{id: 1, value: 50},
        {id: 2, value: 100},
        {id: 3, value: 150},
        {id: 4, value: 200}
      ]
      this.amount = this.priceTag[0].value;
      this.userID = userSesson.user.userId;    
    
  }
  
  async ionViewWillEnter() {
    this.getWalletBalance();
  }

  async getWalletBalance() {
    this.walletBalanceLoader = true;
    this.minimumWalletBalance = await this.dashboardService.getItem(constString.MINIMUM_WALLET_BALANCE);
    this.dashboardService.getWalletBalance().subscribe(data => {
      if (data.hasError === false) {
        this.walletBalanceLoader = false
        this.walletBalance = data;
        if(+this.walletBalance.walletBalance < +this.minimumWalletBalance) {
          this.amount = (this.minimumWalletBalance - this.walletBalance.walletBalance).toFixed(2)
        }
        else {
          this.amount = this.priceTag[0].value;
        }

      }
    }, (error: any) => {
      this.walletBalanceLoader = false
    })
  }
  changeAmount() {
    this.amount.length || this.amount > 0 ? this.amountError = false : this.amountError = true;
  }

  rechargeWallet() {
    if(!this.amount) {
      this.amountError = true;
      return
    }
    this.amountError = false;
    let data = {"userId": this.userID, "rechargeAmount": this.amount}
    this.dashboardService.rechargeWallet(data).subscribe(data => {
      this.openPaymentInApp(data.orderId, data.paymentLink)
    })

  }

  openPaymentInApp(orderId, paymentLink) {
    const options: InAppBrowserOptions = { hideurlbar: 'yes', location: 'yes', hidenavigationbuttons: 'yes' }
    const browser = this.iab.create(paymentLink, '_blank', options);
    browser.on('loadstop').subscribe(event => {
      var closeUrlTest = 'https://payments-test.cashfree.com/pgbillpayuiapi/gateway/process/sim';
      // var closeUrlProd = 'https://payments.cashfree.com/pgbillpayuiapi/gateway/process/sim';
      var closeUrlProd = 'https://payments.cashfree.com/pgbillpayuiapi/gateway/thankyou';

      // var closeUrlTest = 'https://test.cashfree.com/billpay/sim/thankyou';
      // var closeUrlProd = 'https://www.cashfree.com/gateway/thankyou';


      //{"type":"loadstop","url":"https://test.cashfree.com/pgsim/simulator"}
      //{"type":"loadstop","url":"https://payments-test.cashfree.com/pgbillpayuiapi/gateway/process/sim/o3AnDdNUZSrTc9WfRpJlstB0NWtAKOgJwCVNVM8fypgDnrPoQw=="}
      
      // {"type":"loadstop","url":"https://payments.cashfree.com/pgbillpayuiapi/gateway/thankyou/process/fuJRPxzvORbXUAXlbsRz9HT6FfAU8KCdKxvlhfWOwwDjcXSb_t0=?cfBrowserID=_15iczqrfw&appVersion=0.0.0"}
      
      // if (event.url == closeUrlProd || event.url == closeUrlTest || event.url == `${closeUrlTest}/`) {
      if (event.url.includes(closeUrlProd) || event.url.includes(closeUrlTest) || event.url.includes(`${closeUrlTest}/`)) {
        browser.close();
        this.loaderService.showLoader('Loading...');
        this.dashboardService.getRechargeWalletOrderStatus(orderId).subscribe(data => {
          if (data.hasError === false) {
            this.getWalletBalance();
            this.loaderService.hideLoader()
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

  changeTagColor(selected:number) {
    this.amountError = false;
    for(let i = 0; i < this.tagDefaultColor.length; i++) {
      if(selected == i) {
        this.tagDefaultColor[i] = "danger"
        this.amount = this.priceTag[i].value
        // this.walletBalance.walletBalance > +this.minimumWalletBalance ? this.amount = this.priceTag[i].value : this.amount = this.minimumWalletBalance - this.walletBalance.walletBalance

      }
      else {
        this.tagDefaultColor[i] = "dark"
      }
    }
  }

}
