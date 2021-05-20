import { Component, OnInit } from '@angular/core';
import { DashBoardService } from '../dashboard/dashboard.service';
import { LoaderService } from '../services/loading.service';
import { AlertService } from '../services/alert.service';
import { constString } from '../constString';
import * as moment from 'moment';
import { indexOf } from 'core-js/core/array';
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
  
  constructor(private dashboardService: DashBoardService, private alertService: AlertService, private loaderService: LoaderService) { }

  ngOnInit() {
    var currentMonth:any = moment().format("M");
    var lastMonth:any = moment().month(moment().subtract(1, 'month').format('MMMM')).format("M");
    var lastToLastMonth:any = moment().month(moment().subtract(2, 'month').format('MMMM')).format("M");

    // var currentMonth = new Date().getMonth() + 1;
    // var lastMonth = new Date().getMonth();
    // var lastToLastMonth = new Date().getMonth() - 1;
    this.lastMonthName = moment().subtract(1, 'month').format('MMMM, YYYY');
    this.lastToLastMonthName = moment().subtract(2, 'month').format('MMMM, YYYY');

    // this.userTransactions = [
    //   {transactionStartTime: '2020-10-08T07:07:18',siteName: 'Sahyadri', unitsConsumed: '2', transactionAmount: '30', paymentMode: 'Cash'},
    //   {transactionStartTime: '2020-10-08T07:07:18',siteName: 'Sahyadri', unitsConsumed: '2', transactionAmount: '30', paymentMode: 'Cash'},
    //   {transactionStartTime: '2020-12-08T07:07:18',siteName: 'Sahyadri', unitsConsumed: '2', transactionAmount: '50', paymentMode: 'Cash'},
    //   {transactionStartTime: '2020-12-08T07:07:18',siteName: 'Sahyadri', unitsConsumed: '2', transactionAmount: '60', paymentMode: 'Cash'},
    //   {transactionStartTime: '2021-01-08T07:07:18',siteName: 'Sahyadri', unitsConsumed: '2', transactionAmount: '100', paymentMode: 'Cash'},
    //   {transactionStartTime: '2021-02-08T07:07:18',siteName: 'Sahyadri', unitsConsumed: '2', transactionAmount: '80', paymentMode: 'Cash'},
    // ]

    var currentYear = new Date().getFullYear();
    
    this.dashboardService.getUserTransactions().subscribe(data => {
      if (data.hasError === false) {
        this.userTransactions = data.userTransactionViewModels;

        this.currentMonthTransactions = this.userTransactions.filter(data => {
          var [year, month] = data.transactionStartTime.split('-');
          // return (+currentMonth === +month) && (currentYear == year); 
          return (+currentMonth === +month); 
        })
        this.lastMonthTransactions = this.userTransactions.filter(data => {
          var [year, month] = data.transactionStartTime.split('-');
          return (+lastMonth === +month); 
        })
        this.lastToLastMonthTransactions = this.userTransactions.filter(data => {
          var [year, month] = data.transactionStartTime.split('-');
          return (+lastToLastMonth === +month); 
        })

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
    // return moment(new Date(date + 'Z')).utcOffset('+0530').format("DD MMM yyyy hh:mm A")
    return moment(new Date(date + 'Z')).utcOffset(330).format("DD MMM YYYY, hh:mm A")
  }

}
