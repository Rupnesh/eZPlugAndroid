import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SearchModal } from './search-modal';
import { DashBoardService } from '../../dashboard/dashboard.service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';

const routes: Routes = [
  {
    path: '',
    component: SearchModal,
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    IonicModule,
    RouterModule.forChild(routes),
    Ng2SearchPipeModule
  ],
  declarations: [SearchModal],
  providers: [DashBoardService]
})
export class SearchModalModule {}
