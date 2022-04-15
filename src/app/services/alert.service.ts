import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { constString } from '../constString';

@Injectable({
	providedIn: 'root'
})
export class AlertService {

	constructor(private toastController: ToastController,
		public alertController: AlertController,
		public router: Router,
		public storage: StorageService,
		private auth: AuthService) { }

	async presentToast(msg) {
		const toast = await this.toastController.create({
			message: msg,
			duration: 2000
		});
		toast.present();
	}

	async presentAlertModel(msg, route) {
		const alert = await this.alertController.create({
		header: 'Warning!',
		message: msg,
		buttons: [
			{
				text: 'Cancel',
				role: 'cancel',
			},
			{
				text: 'Okay',
				handler: () => {
					this.router.navigate([route])
				}
			}
		]
    	});

    	await alert.present();
	}
	async presentAlert(msg, route) {
		const alert = await this.alertController.create({
		header: 'Warning!',
		message: msg,
		buttons: [
			{
				text: 'Okay',
				handler: async () => {
					let userDetails = await this.storage.getObject(constString.OTP_SESSION);
					let refreshToken = userDetails.accessToken.refreshToken;
          			let userId = userDetails.user.userId;
					this.auth.refreshToken({refreshToken, userId}).subscribe(data => {
						this.storage.setObject(constString.OTP_SESSION, data)
					})
					setTimeout( () => {
						location.reload();
					}, 5000)
					// this.storage.removeItem().then(data => {
					// 	this.router.navigate([route])
					// });
				}
			}
		]
    	});

    	await alert.present();
	}
	async presentAlertPopup(msg, route) {
		const alert = await this.alertController.create({
		header: 'Warning!',
		message: msg,
		buttons: [
			{
				text: 'Okay',
				handler: () => {
					this.router.navigate([route])
				}
			}
		]
    	});

    	await alert.present();
	}

}