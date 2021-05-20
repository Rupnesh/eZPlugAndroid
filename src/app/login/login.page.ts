import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MenuController, ToastController, Platform } from '@ionic/angular';

import { Plugins } from '@capacitor/core';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';
import { LoaderService } from '../services/loading.service';
import { AlertService } from '../services/alert.service';
import { constString } from '../constString';
const { Storage, Device, StatusBar } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: [
    './styles/login.page.scss'
  ]
})
export class LoginPage implements OnInit {
  mobileNumber:any;
  numberValidate:any;
  info: any = [];
  sessionId: any; 

  constructor(
    public router: Router,
    public menu: MenuController,
    public toastController: ToastController,
    public auth: AuthService,
    public storage: StorageService,
    public loaderService: LoaderService,
    public alertService: AlertService,
    public platform: Platform
  ) {
    
  }

  async ngOnInit() {
    this.menu.enable(false);
    if(this.platform.is('android') || this.platform.is('ios')) {
      StatusBar.setBackgroundColor({ color: '#216581' });
    }
    this.numberValidate = 0;
    this.info = await Device.getInfo();
  }

  async componentDidLoad() {
  }
  ionViewWillEnter() {
    this.menu.enable(false);
    this.numberValidate = 0;
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  mobileInput() { 
    this.numberValidate = this.mobileNumber.toString().length;  
  }

  doLogin() {
    
    this.loaderService.showLoader('Please wait...')
    this.auth.getOTP(this.mobileNumber).subscribe(data => {
      if (data.hasError === false) {
        console.log("success...")
        this.sessionId = data.sessionId;
        let queryParams = {mobile: this.mobileNumber, sessionId: this.sessionId}
        this.router.navigate(['/auth/signup'], { queryParams} );
        this.loaderService.hideLoader();
      }
    }, (error: any) => {
      console.log(error)
      if(error.status === 404) {
        this.loaderService.hideLoader();
        this.alertService.presentToast(error.name);
      }
      else {
        this.loaderService.hideLoader();
        this.alertService.presentToast(error.error.errorMessage);
      }
    })
  }

}