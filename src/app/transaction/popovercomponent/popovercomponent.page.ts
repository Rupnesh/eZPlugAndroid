import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-popovercomponent',
  template: './popovercomponent.page.html',
  styleUrls: ['./popovercomponent.page.scss'],
})
export class PopovercomponentPage implements OnInit {
  selectedFilter:any = ""
  constructor(private popoverController: PopoverController, private storage: StorageService) { }

  async ngOnInit() {
    this.selectedFilter = await this.storage.getItem('SELECTED_FILTER')
  }

  onSelect(event) {
    this.storage.setItem('SELECTED_FILTER', event.target.value)
    this.selectedFilter = event.target.value;
    this.popoverController.dismiss({data: this.selectedFilter})
  }

}
