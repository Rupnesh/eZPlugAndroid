import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';

import { constString } from '../constString';
import { StorageService } from '../services/storage.service'
import { AuthService } from '../services/auth.service'
import { LoaderService } from '../services/loading.service'
import { AlertService } from '../services/alert.service'
import { NgForm } from '@angular/forms';
declare var SMSReceive: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: [
    './styles/signup.page.scss'
  ]
})
export class SignupPage implements OnInit {

  mobileNumber: any = ""
  secondsRemaing: any = 30;
  secondsInterval: any;
  otpRetrive: any = true;
  resendFlag: any = false;
  submitFlag: any = false;

  otp: any = ""

  otpText1: any = "";
  otpText2: any = "";
  otpText3: any = "";
  otpText4: any = "";
  otpText5: any = "";
  otpText6: any = "";

  sessionId: any = "";
  @ViewChild('f',{static: false}) otpForm: NgForm;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private smsRetriever: SmsRetriever,
    public auth: AuthService,
    public storage: StorageService,
    public loaderService: LoaderService,
    public alertService: AlertService,

  ) { }

  ngAfterViewInit() { }
  ionViewDidEnter() { }

  ngOnInit() {
    this.smsRetriever.getAppHash()
      .then((res: any) => {console.log("sms app hask key...", res)})
      .catch((error: any) => console.error(error));

    // this.route.params.subscribe(params => {
    //   console.log(params)
    //   if (params.mobile) {
    //     this.mobileNumber = params.mobile;
    //     this.startSMSRead();
    //   }
    // });

    this.route
      .queryParams
      .subscribe(params => {
        if (params.mobile) {
          this.mobileNumber = params.mobile;
          this.sessionId = params.sessionId;
          this.startSMSRead();
        }
      });
  }

  startSMSRead() {
    window.clearInterval(this.secondsInterval)
    this.secondsInterval = setInterval(() => {
      if (this.secondsRemaing === 0) {
        clearInterval(this.secondsInterval);
        this.resendFlag = true;
        this.otpRetrive = false;
      }
      else {
        this.otpRetrive = true;
        this.resendFlag = false;
        this.secondsRemaing = this.secondsRemaing - 1;
      }
      this.submitFlag = false;
    }, 1000);

    this.smsRetriever.startWatching()
      .then((res: any) => {
        this.otp = /(\d{4})/g.exec(res.Message)[1];
        
          if (this.otp) {
            this.otpText1 = this.otp.charAt(0)
            this.otpText2 = this.otp.charAt(1)
            this.otpText3 = this.otp.charAt(2)
            this.otpText4 = this.otp.charAt(3)
            this.submitFlag = true;
            this.submitOTP();
          }
          else {
            
          }
        
        
      })
      .catch((error: any) => console.error(error));
  }


  otpController(event, next, prev, index) {
    if (this.otpText1 && this.otpText2 && this.otpText3 && this.otpText4) {
      clearInterval(this.secondsInterval);
      this.resendFlag = false;
      this.otpRetrive = false;
      this.submitFlag = true;
      this.submitOTP();
    }
    else {
      console.log("index...",index)
      // if(index === 0) this.otpText1 = event.target.value.slice(0, 1);
      // if(index === 1) this.otpText2 = event.target.value.slice(0, 1);
      // if(index === 2) this.otpText3 = event.target.value.slice(0, 1);
      // if(index === 3) this.otpText4 = event.target.value.slice(0, 1);

      if (event.target.value.length < 1 && prev) {
        prev.setFocus()
      }
      else if (next && event.target.value.length > 0) {
        next.setFocus();
      }
      else {
        return 0;
      }
      this.submitFlag = false;
    }
  }
  onOTPPaste(e) {
    this.otp = e.clipboardData.getData('text')
    this.otpText1 = ''
    setTimeout((data) => {
      this.otpText1 = this.otp.charAt(0)
      this.otpText2 = this.otp.charAt(1)
      this.otpText3 = this.otp.charAt(2)
      this.otpText4 = this.otp.charAt(3)
    }, 10)
  }
  

  submitOTP() {
    this.loaderService.showLoader('Please wait...')
    let otpText = this.otpText1.toString() + this.otpText2.toString() + this.otpText3.toString() + this.otpText4.toString();
    // let otpText = this.otpText1.toString() + this.otpText2.toString() + this.otpText3.toString() + this.otpText4.toString() + this.otpText5.toString() + this.otpText6.toString()

    let data = {
      "PhoneNumber": this.mobileNumber,
      "SessionId": this.sessionId,
      "OTP": otpText
    }
    this.auth.verfiyOTP(data).subscribe(data => {
      if (data.hasError === false) {
        this.loaderService.hideLoader();
        this.storage.setItem(constString.LOGIN_STATUS, "true")
        this.storage.setObject(constString.OTP_SESSION, data)
        this.router.navigate(['app/dashboard']);
      }
      else {
        this.loaderService.hideLoader();
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.loaderService.hideLoader();
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })

  }

  resendOTP() {
    this.secondsRemaing = 30;
    this.resendFlag = false;
    this.otpRetrive = true;

    this.auth.getOTP(this.mobileNumber).subscribe(data => {
      if (data.hasError === false) {
        this.sessionId = data.sessionId;
        this.startSMSRead();
      }
    }, (error: any) => {
    })

    
  }

}
