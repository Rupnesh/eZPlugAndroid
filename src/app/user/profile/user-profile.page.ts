import { Component, OnInit, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AlertController } from '@ionic/angular';

import { LanguageService } from '../../language/language.service';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../services/storage.service'
import { trigger, style, animate, transition, group, query, animateChild, state, keyframes } from '@angular/animations';

import { DashBoardService } from '../../dashboard/dashboard.service';
import { constString } from '../../constString';

import { AlertService } from '../../services/alert.service'
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';



@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.page.html',
  styleUrls: [
    './styles/user-profile.page.scss',
    './styles/user-profile.shell.scss',
    './styles/user-profile.ios.scss',
    './styles/user-profile.md.scss'
  ],
  animations: [

    trigger('slideleft', [
      transition('void => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('500ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
    ])

  ]
})
export class UserProfilePage implements OnInit {
  userDetails: any
  userContact: any
  available_languages = [];
  translations;
  userData: any = [];
  addvehicle = false

  profileSeg: any = 'details';
  // profileSeg: any = 'vehicles';
  isEdit: any = false;

  profileData: any = [];
  vehicleList: any = []
  previousIndex = 0;
  nextIndex;
  vehicleAdd = {}
  userID
  loadVehiclesLoader = true;
  loadUserProfileLoader = false
  updateUserProfileLoader = false;
  vehicleNoDataFound = false
  addVehicleLoader = false;
  updateVehicleLoader = false;
  userUpdate = [];
  userUpdateForm: FormGroup;

  validation_messages = {
    'firstName': [
      { type: 'required', message: 'First name is required.' },
      { type: 'minlength', message: 'First name must be at least 5 characters long.' },
      { type: 'maxlength', message: 'First name cannot be more than 25 characters long.' },
      // { type: 'pattern', message: 'Your First name must contain only numbers and letters.' },
    ],
    'lastName': [
      { type: 'required', message: 'Last name is required.' }
    ],
    'email': [
      { type: 'required', message: 'Email required.' },
      { type: 'pattern', message: 'Enter valid email' },
    ],
    'phone': [
      { type: 'required', message: 'Phone number required.' },
    ],
    'companyName': [
      { type: 'required', message: 'Company name required.' },
    ],
  }
  edit = false;
  walletBalance: any = [];

  constructor(
    private route: ActivatedRoute,
    public translate: TranslateService,
    public languageService: LanguageService,
    public alertController: AlertController,
    public storage: StorageService,
    private dashboardService: DashBoardService,
    public alertService: AlertService,
    private formBuilder: FormBuilder
  ) { }

  async ngOnInit() {
    this.profileData.gender = 'Male';
    this.userContact = await this.storage.getObject(constString.OTP_SESSION);

    this.userUpdateForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.compose([
        Validators.maxLength(25),
        Validators.minLength(2),
        // Validators.pattern('^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$'),
        Validators.required
      ])),
      lastName: new FormControl('', Validators.compose([
        Validators.required
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      phone: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      companyName: new FormControl('', Validators.compose([
        Validators.required,
      ])),


    })

    this.getTranslations();

    this.translate.onLangChange.subscribe(() => {
      this.getTranslations();
    });



  }
  async ngAfterViewInit() {
    let objUserSession = await this.dashboardService.getObject(constString.OTP_SESSION);
    this.userID = objUserSession.user.userId;
    this.loadUserProfile();
    this.loadVehicles();
    // this.getWalletBalance();

    // this.vehicleList = [
    //   {vehicleId:"", vehicleCompany:"Honda", vehicleName:"Hornet", vehicleNumber:"MH14DG7410", chargerType:"C1"},
    //   {vehicleId:"", vehicleCompany:"Honda", vehicleName:"Shine", vehicleNumber:"MH14BD4555", chargerType:"C1"},
    //   {vehicleId:"", vehicleCompany:"Suzuki", vehicleName:"FZ1", vehicleNumber:"MH14GT6565", chargerType:"C1"},      
    // ]

  }
  loadVehicles() {
    this.loadVehiclesLoader = true;
    this.dashboardService.getAllActiveVehicles(this.userID).subscribe(data => {
      if (data.hasError === false) {
        this.vehicleList = data.vehicleViewModels;
        this.loadVehiclesLoader = false;
      }
      else {
        this.alertService.presentToast(data.errorDescription)
        this.vehicleNoDataFound = true
      }
    }, (error: any) => {
      if (error.status === 401)
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
      this.vehicleNoDataFound = true
    })
  }
  loadUserProfile() {
    this.loadUserProfileLoader = true;
    this.dashboardService.getUserById(this.userID).subscribe(data => {
      if (data.hasError === false) {
        this.userDetails = data;
        this.loadUserProfileLoader = false;
      }
      else {
        this.alertService.presentToast(data.errorDescription)
        this.vehicleNoDataFound = true
      }
    }, (error: any) => {
      if (error.status === 401) {
      }
      this.vehicleNoDataFound = true
      this.loadUserProfileLoader = false;
    })
  }

  getWalletBalance() {
    this.dashboardService.getWalletBalance().subscribe(data => {
      if (data.hasError === false) {
        this.walletBalance = data;
      }
    }, (error: any) => {
    })
  }

  CreateRecord() {
    this.vehicleAdd['isActive'] = true;
    this.vehicleAdd['userId'] = this.userID;
    this.addVehicleLoader = true;
    this.dashboardService.addVehicle(this.vehicleAdd).subscribe(data => {
      if (data.hasError === false) {
        this.alertService.presentToast(this.translations.ADD_DONE)
        // this.alertService.presentToast("Record Added")
        this.addvehicle = false;
        this.addVehicleLoader = false;
        this.loadVehicles();
      }
      else {
        this.addVehicleLoader = false;
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.addVehicleLoader = false;
      if (error.status === 401)
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
    })
  }
  UpdateRecord(recordRow) {
    delete recordRow['isEdit'];
    recordRow['isActive'] = true;
    recordRow['userId'] = this.userID;

    this.updateVehicleLoader = true;

    this.dashboardService.updateVehicle(recordRow).subscribe(data => {
      if (data.hasError === false) {
        this.alertService.presentToast(this.translations.UPDATE_DONE)
        // this.alertService.presentToast("Record Updated")
        this.addvehicle = false;
        this.updateVehicleLoader = false;
        this.loadVehicles();
      }
      else {
        this.updateVehicleLoader = false;
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.updateVehicleLoader = false;
      if (error.status === 401)
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
    })
  }

  RemoveRecord(record) {
    console.log(record)
    let serverData = {"id": record.vehicleId, "isActive": false}
    this.dashboardService.deleteVehicle(serverData).subscribe(data => {
      if (data.hasError === false) {
        this.loadVehicles();
      }
    }, (error: any) => {
      if (error.status === 401)
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
    })
  }
  cancelUpdate(record) {
    record.isEdit = false;
    this.ngAfterViewInit()
  }
  EditRecord(record, index) {

    if (this.nextIndex == null) {
      this.nextIndex = index
    }
    else {
      this.previousIndex = this.nextIndex
      this.nextIndex = index;
    }
    if (this.previousIndex == this.nextIndex) {
      index == 0 ? record.isEdit = !record.isEdit : record.isEdit = !record.isEdit
    }
    else {
      this.vehicleList.map((data, i) => { index === i ? data.isEdit = true : data.isEdit = false })
    }

  }


  getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    this.translate.getTranslation(this.translate.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
      });
  }

  async openLanguageChooser() {
    this.available_languages = this.languageService.getLanguages()
      .map(item =>
        ({
          name: item.name,
          type: 'radio',
          label: item.name,
          value: item.code,
          checked: item.code === this.translate.currentLang
        })
      );

    const alert = await this.alertController.create({
      header: this.translations.SELECT_LANGUAGE,
      inputs: this.available_languages,
      cssClass: 'language-alert',
      buttons: [
        {
          text: this.translations.CANCEL,
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => { }
        }, {
          text: this.translations.OK,
          handler: (data) => {
            if (data) {
              this.translate.use(data);
              this.dashboardService.setItem(data, constString.USER_LANGUAGE)
            }
          }
        }
      ]
    });
    await alert.present();
  }

  updateProfile() {
    this.userUpdateForm['userId'] = this.userID;
    let serverObj = { userId: this.userID, ...this.userUpdateForm.value }
    this.updateUserProfileLoader = true;
    this.dashboardService.updateUserDetails(serverObj).subscribe(data => {
      if (data.hasError === false) {
        this.userDetails = data;
        this.updateUserProfileLoader = false;
        this.isEdit = false;
        this.alertService.presentToast(this.translations.UPDATE_DONE)
        // this.alertService.presentToast("Updated!!!")
        this.loadUserProfile()
      }
      else {
        this.alertService.presentToast(data.errorDescription)
        this.vehicleNoDataFound = true
        this.updateUserProfileLoader = false;
      }
    }, (error: any) => {
      if (error.status === 401)
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
      this.vehicleNoDataFound = true
      this.updateUserProfileLoader = false;
    })
  }
  editProfile() {
    this.isEdit = true
    this.userUpdateForm.patchValue({
      firstName: this.userDetails.firstName,
      lastName: this.userDetails.lastName,
      email: this.userDetails.email,
      phone: this.userDetails.phone,
      companyName: this.userDetails.companyName,
    })
  }
}
