import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { StationDetailsPage } from './station-details.page';
import { WalletModal} from '../wallet-modal/wallet.page'
const routes: Routes = [
  {
    path: '',
    component: StationDetailsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [StationDetailsPage,WalletModal],
  entryComponents: [WalletModal]
})
export class StationDetailsPageModule {}
