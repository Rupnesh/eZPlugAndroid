import { Component, Input, OnInit } from '@angular/core';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { constString } from '../../constString';
import { DashBoardService } from '../../dashboard/dashboard.service';
import { LoaderService } from '../../services/loading.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletModal implements OnInit {
  tagDefaultColor:any = [];
  priceTag:any = []
  amount:any;
  walletBalance       : any = [];
  minimumWalletBalance:any;
  walletBalanceLoader : boolean;
  amountError         : any = false;
  userID              : any;
  @Input() showMenu   : boolean;

  constructor(private dashboardService: DashBoardService, private iab: InAppBrowser,private loaderService: LoaderService) { 
    
  }

  async ngOnInit() {
    
    
    
  }
  
  async ionViewDidEnter() {
      this.tagDefaultColor = ["danger","dark", "dark", "dark"]
      this.priceTag = [{id: 1, value: 50},
        {id: 2, value: 100},
        {id: 3, value: 150},
        {id: 4, value: 200}
      ]
      
      let userSesson = await this.dashboardService.getObject(constString.OTP_SESSION);
      this.userID = userSesson.user.userId;
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
          this.amount = this.minimumWalletBalance - this.walletBalance.walletBalance
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
      var closeUrlTest = 'https://test.cashfree.com/billpay/sim/thankyou';
      var closeUrlProd = 'https://www.cashfree.com/gateway/thankyou';
      if (event.url == closeUrlProd || event.url == closeUrlTest || event.url == `${closeUrlTest}/`) {
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
