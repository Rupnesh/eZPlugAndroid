import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../dashboard/dashboard.service';
import { LoaderService } from '../services/loading.service';
import { AlertService } from '../services/alert.service';
import { constString } from '../constString';
import * as moment from 'moment';
import { PopoverController } from '@ionic/angular';
import { PopovercomponentPage } from './popovercomponent/popovercomponent.page';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss'],
})
export class TransactionPage implements OnInit {
  userTransactions: any;
  currentMonthTransactions: any = [];
  lastMonthTransactions: any = [];
  lastToLastMonthTransactions: any = [];
  lastToLastMonthName:any;
  lastMonthName: string;
  showAll: any = false;
  overallData = {};
  lastThreeMonths = []
  
  constructor(private dashboardService: DashBoardService, private alertService: AlertService, 
    private loaderService: LoaderService, private storage: StorageService, private popoverController: PopoverController) { }

  ngOnInit() {
    this.storage.setItem('SELECTED_FILTER', 'last3month')
    
    this.lastMonthName = moment().subtract(1, 'month').format('MMMM, YYYY');
    this.lastToLastMonthName = moment().subtract(2, 'month').format('MMMM, YYYY');
    
    this.dashboardService.getUserTransactions().subscribe(data => {
      if (data.hasError === false) {
        this.userTransactions = data.userTransactionViewModels;

        this.userTransactions.sort((a, b) => {
          var aStartTime:any = new Date(a.transactionStartTime);
          var bStartTime:any = new Date(b.transactionStartTime);
          return bStartTime - aStartTime; // ascending
        })
        this.showLast3MonthsTransactions();

      }
    }, (error: any) => {
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
      this.loaderService.hideLoader();
    })

  }

  formatter(value) {
    return Number(value).toFixed(2);
  }
  dateFormatter(date) {
    return moment(new Date(date + 'Z')).utcOffset(330).format("DD MMM YYYY, hh:mm A")
  }

  getListHeader(item) {
    let currentMonth = moment().format('M');
    let lastMonth = moment().subtract(1, 'month').format('M');
    let lastToLastMonth = moment().subtract(2, 'month').format('M');
    let lastToLastMonthName = moment().subtract(2, 'month').format('MMMM, YYYY');
    if(+item === +currentMonth) return 'This Month'
    if(+item === +lastMonth) return 'Last Month'
    if(+item === +lastToLastMonth) return lastToLastMonthName
  }

  async openFilterOptions(ev:any) {
    const popover = await this.popoverController.create({
      component: PopovercomponentPage,
      cssClass: 'my-custom-class',
      event: ev,
      translucent: true
    });
    await popover.present();
  
    const { data } = await popover.onDidDismiss();
    if(data?.data === 'all') this.showAll = true;
    if(data?.data === 'currentmonth') this.showCurrentMonthTransactions();
    if(data?.data === 'lastmonth') this.showLastMonthTransactions();
    if(data?.data === 'last3month') this.showLast3MonthsTransactions();
  }

  showLast3MonthsTransactions() {
    this.showAll = false;
    var currentMonth:any = moment().format("M");
    var lastMonth:any = moment().month(moment().subtract(1, 'month').format('MMMM')).format("M");
    var lastToLastMonth:any = moment().month(moment().subtract(2, 'month').format('MMMM')).format("M");
    var currentYear = new Date().getFullYear();
    var lastYear = new Date().getFullYear()-1;

    this.lastThreeMonths = [currentMonth, lastMonth, lastToLastMonth];
    this.lastThreeMonths.forEach(item => {
      if(!this.overallData[item]) this.overallData[item] = [];
    })

    this.userTransactions.filter(item => {
      var [year, month] = item.transactionStartTime.split('-');
      if(+month === +currentMonth && +year === +currentYear) this.overallData[currentMonth].push(item)
      
      if(+month === +lastMonth && +year === +currentYear) 
        this.overallData[lastMonth].push(item)
      else if(+month === +lastMonth && +year === +lastYear)
        this.overallData[lastMonth].push(item)
      
      if(+month === +lastToLastMonth && +year === +currentYear)
       this.overallData[lastToLastMonth].push(item) 
      else if(+month === +lastToLastMonth && +year === +lastYear)
        this.overallData[lastToLastMonth].push(item)
    })

  }
  showCurrentMonthTransactions() {
    this.showAll = false;
    this.overallData = {};
    var currentMonth:any = moment().format("M");
    var currentYear = new Date().getFullYear();
    this.lastThreeMonths = [currentMonth];
    this.lastThreeMonths.forEach(item => {
      if(!this.overallData[item]) this.overallData[item] = [];
    })

    this.userTransactions.filter(item => {
      var [year, month] = item.transactionStartTime.split('-');
      if(+month === +currentMonth && +year === +currentYear) this.overallData[currentMonth].push(item)
    })
  }

  showLastMonthTransactions() {
    this.showAll = false;
    this.overallData = {};
    var currentMonth:any = moment().format("M");
    var currentYear = new Date().getFullYear();
    var lastMonth:any = moment().month(moment().subtract(1, 'month').format('MMMM')).format("M");
    var lastYear = new Date().getFullYear()-1;

    this.lastThreeMonths = [lastMonth];
    this.lastThreeMonths.forEach(item => {
      if(!this.overallData[item]) this.overallData[item] = [];
    })

    this.userTransactions.filter(item => {
      var [year, month] = item.transactionStartTime.split('-');
      if(+month === +lastMonth && +year === +currentYear) 
        this.overallData[lastMonth].push(item)
      else if(+month === +lastMonth && +year === +lastYear)
        this.overallData[lastMonth].push(item)
    })
  }

}
