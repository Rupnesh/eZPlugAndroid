import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChargePage } from './charge.page';
import { DashBoardService } from '../../dashboard/dashboard.service'

import { BillPage } from './bill/bill.page'
import { StorageService } from '../../services/storage.service';

const routes: Routes = [
  {
    path: '',
    component: ChargePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
  ],
  declarations: [ChargePage, BillPage],
  providers: [DashBoardService, StorageService],
  entryComponents: [
    BillPage
  ],
})
export class ChargePageModule { }
