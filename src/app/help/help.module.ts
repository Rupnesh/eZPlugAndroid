import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpPage } from './help.page';



const routes: Routes = [
  {
    path: '',
    component: HelpPage,
    resolve: {
    }
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),

  ],
  declarations: [ HelpPage ],
  providers: [
  ]
})
export class HelpPageModule {}
