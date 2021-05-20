import { Injectable } from '@angular/core';
import { ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
	providedIn: 'root'
})
export class AlertService {

	constructor(private toastController: ToastController,
		public alertController: AlertController,
		public router: Router,
		public storage: StorageService) { }

	async presentToast(msg) {
		const toast = await this.toastController.create({
			message: msg,
			duration: 2000
		});
		toast.present();
	}

	async presentAlert(msg, route) {
		const alert = await this.alertController.create({
      header: 'Warning!',
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: () => {
						this.storage.removeItem().then(data => {
							this.router.navigate([route])
						});
          }
        }
      ]
    });

    await alert.present();
	}

}