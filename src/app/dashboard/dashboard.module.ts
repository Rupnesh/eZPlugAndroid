import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentsModule } from '../components/components.module';
import { DashboardPage } from './dashboard.page';
import { NetworkService } from '../../app/services/network.service'
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InterceptorService } from '../services/interceptor.service';
import { UrlInterceptor } from '../services/url.interceptor';
const categoriesRoutes: Routes = [
  {
    path: '', component: DashboardPage,
    children: [
      {
        path: 'dashboard',
        children: [
          { path: '', loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardPageModule) }
        ]
      }
    ]
  },
  { path: 'homesearch', loadChildren: () => import('../dashboardPages/search-modal/search-modal.module').then(m => m.SearchModalModule) },
  { path: 'station-details/:id', loadChildren: () => import('../dashboardPages/station-details/station-details.module').then(m => m.StationDetailsPageModule) },
  { path: 'station-details', loadChildren: () => import('../dashboardPages/station-details/station-details.module').then(m => m.StationDetailsPageModule) },
  { path: 'search-near-by', loadChildren: () => import('../dashboardPages/search-near-by/search-near-by.module').then(m => m.SearchNearByPageModule) },
  { path: 'charge', loadChildren: () => import('../dashboardPages/charge/charge.module').then(m => m.ChargePageModule) },
  { path: 'bill', loadChildren: () => import('../dashboardPages/bill/bill.module').then(m => m.BillPageModule) },
  { path: '', redirectTo: 'app/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ComponentsModule,
    RouterModule.forChild(categoriesRoutes),
  ],
  declarations: [ DashboardPage],
  providers: [NetworkService,
    { provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UrlInterceptor, multi: true },
  ]
})
export class DashboardPageModule {}
