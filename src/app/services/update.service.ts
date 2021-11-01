import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, Platform } from '@ionic/angular';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Market } from '@ionic-native/market/ngx';

interface AppUpdate {
  current: string;
  enabled: boolean;
  majorMsg? : {
    title: string;
    message: string;
    button: string
  };
  minorMsg? : {
    title: string;
    message: string;
    button: string
  }
}

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  updateUrl = 'https://ztriciotstorage.blob.core.windows.net/mobile-app-update/app-version.json'
  constructor(private http: HttpClient, private alertCtrl: AlertController, private appVersion: AppVersion, private iab: InAppBrowser,
    private platform: Platform, public market: Market) { 

  }

  async checkForUpdate() {
    var httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Accept': 'application/json'
      })
    }
    this.http.get(this.updateUrl, httpOptions ).subscribe(async (info: AppUpdate) => {
      if(!info.enabled) {
        this.presentAlert(info.majorMsg.title, info.majorMsg.message)
      }
      else {
        // const versionNumber = "0.2";
        if(this.platform.is('android') || this.platform.is('ios')) {
          const versionNumber = await this.appVersion.getVersionNumber();
          const splittedVersion = versionNumber.split('.');
          const serverVersion = info.current.split('.');
          if(serverVersion[0] > splittedVersion[0]) {
            this.presentAlert(info.majorMsg.title, info.majorMsg.message, info.majorMsg.button)
          }
          else if(serverVersion[1] > splittedVersion[1]) {
            this.presentAlert(info.minorMsg.title, info.minorMsg.message, info.minorMsg.button, true)
          }
        }
      }
    })
  }

  openAppStoreEntry() {
    if(this.platform.is('android')) {
      this.market.open('io.ev.eZCharge');
    }
    else {
      this.iab.create('itms-apps://itunes.apple.com/app/id1469563885', '_blank')
    }
  }

  async presentAlert(header, message, buttonText = '', allowClose = false) {
    const buttons = [];
    if(buttonText != '') {
      buttons.push({
        text : buttonText, 
        handler : () => {
          this.openAppStoreEntry()
        }
      })
    }
    if(allowClose) {
      buttons.push({text : 'Close', role: 'cancel'})
    }
    const alert = await this.alertCtrl.create({
      header, message, buttons, backdropDismiss: allowClose
    });
    await alert.present();

  }

}
