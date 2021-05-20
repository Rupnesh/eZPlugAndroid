import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SignupPage } from './signup.page';

import { AuthService } from '../services/auth.service'
import { StorageService } from '../services/storage.service';

import { SmsRetriever } from '@ionic-native/sms-retriever/ngx';

const routes: Routes = [
  {
    path: '',
    component: SignupPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [SignupPage, ],
  entryComponents: [],
  providers: [AuthService, StorageService, SmsRetriever]
})
export class SignupPageModule {}
