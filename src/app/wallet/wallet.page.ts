import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../dashboard/dashboard.service';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  tagDefaultColor = ["danger","dark", "dark", "dark"];
  priceTag = [
    {id: 1, value: 50},
    {id: 2, value: 100},
    {id: 3, value: 150},
    {id: 4, value: 200},
  ]
  amount:any;
  walletBalance: any = [];
  amountError:any = false;
  constructor(private dashboardService: DashBoardService) { }

  ngOnInit() {
    this.amount = this.priceTag[0].value;
    this.getWalletBalance();
  }

  getWalletBalance() {
    this.dashboardService.getWalletBalance().subscribe(data => {
      if (data.hasError === false) {
        this.walletBalance = data;
      }
    }, (error: any) => {
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

  }

  changeTagColor(selected:number) {
    this.amountError = false;
    for(let i = 0; i < this.tagDefaultColor.length; i++) {
      if(selected == i) {
        this.tagDefaultColor[i] = "danger"
        this.amount = this.priceTag[i].value
      }
      else {
        this.tagDefaultColor[i] = "dark"
      }
    }
  }

}
