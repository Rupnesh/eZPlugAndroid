import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SearchNearByPage } from './search-near-by.page';
import { ComponentsModule } from '../../components/components.module';

import { DashBoardService } from '../../dashboard/dashboard.service';
import { UrlInterceptor } from '../../services/url.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';


const routes: Routes = [
  {
    path: '',
    component: SearchNearByPage,
  }
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule, 
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SearchNearByPage],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: UrlInterceptor, multi: true },
    DashBoardService]
})
export class SearchNearByPageModule {}
