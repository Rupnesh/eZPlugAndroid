import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { DashBoardService } from '../../dashboard/dashboard.service';
import { LoaderService } from '../../services/loading.service'
import { AlertService } from '../../services/alert.service'
import { Router } from '@angular/router'
import { AlertController } from '@ionic/angular';
@Component({
	selector: 'app-payment-status-modal',
	templateUrl: './payment-status-modal.html',
	styleUrls: ['./payment-status-modal.scss'],
})
export class PaymentStatusModal implements OnInit {

	successMessage = "Your payment has been done."
	failedMessage = "Your payment has failed."

	@Input() txStatus: string;
  	@Input() txMsg: string;
	@Input() paymentMode: string;
	@Input() transactionId: string;
	@Input() orderAmount: string;
	@Input() orderId: string;
	@Input() orderCurrency: string;
	@Input() referenceId: string;
	@Input() txTime: string;
	

	constructor(public router: Router, private dashboardService: DashBoardService, public loaderService: LoaderService,
		public alertController: AlertController,
		public alertService: AlertService, private modalController: ModalController
	) {

	}
	ngOnInit() {
		//SUCCESS   UPI   20200911142759   1.26
	}
	closeModal() {
		this.modalController.dismiss()
		if(this.txStatus === "SUCCESS") {
			this.dashboardService.removeItem();
			this.router.navigate(['app/charge'])
		}
		else {
			this.router.navigate(['app/bill'])
		}
  }
}