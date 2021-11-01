import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ShellModule } from '../shell/shell.module';

import { GoogleMapComponent } from './google-map/google-map.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ShellModule,
    IonicModule.forRoot()
  ],
  declarations: [
    GoogleMapComponent
  ],
  exports: [
    ShellModule,
    GoogleMapComponent
  ]
})
export class ComponentsModule {}
