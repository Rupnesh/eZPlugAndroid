import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BillPage } from './bill.page';
import { PaymentStatusModal } from '../payment-status-modal/payment-status-modal';

const routes: Routes = [
  {
    path: '',
    component: BillPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [BillPage, PaymentStatusModal],
  entryComponents: [PaymentStatusModal]
})
export class BillPageModule {}
