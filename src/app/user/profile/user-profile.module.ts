import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { UserProfilePage } from './user-profile.page';
import { UserService } from '../user.service';
import { LanguageService } from '../../language/language.service';
import { TranslateModule } from '@ngx-translate/core';


const routes: Routes = [
  {
    path: '',
    component: UserProfilePage,
    resolve: {
    }
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [UserProfilePage],
  providers: [
    UserService,
    LanguageService
  ]
})
export class UserProfilePageModule {}
