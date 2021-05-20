import { Component, OnInit, AfterViewInit, ViewChild, HostBinding } from '@angular/core';

import { IonSlides, MenuController } from '@ionic/angular';

import { StorageService } from '../services/storage.service'
import { Router } from '@angular/router';
import { constString } from '../constString';
import { Plugins } from '@capacitor/core';
const {  StatusBar } = Plugins;
@Component({
  selector: 'app-walkthrough',
  templateUrl: './walkthrough.page.html',
  styleUrls: [
    './styles/walkthrough.page.scss',
    './styles/walkthrough.shell.scss',
    './styles/walkthrough.responsive.scss'
  ]
})
export class WalkthroughPage implements OnInit, AfterViewInit {
  slidesOptions: any = {
    zoom: {
      toggle: false // Disable zooming to prevent weird double tap zomming on slide images
    }
  };

  @ViewChild(IonSlides, { static: true }) slides: IonSlides;

  @HostBinding('class.first-slide-active') isFirstSlide = true;

  @HostBinding('class.last-slide-active') isLastSlide = false;

  constructor(public menu: MenuController, public storage: StorageService, public router: Router) { }

  ngOnInit(): void {
    this.menu.enable(false);
    StatusBar.setBackgroundColor({ color: '#216581' });
  }

  ngAfterViewInit(): void {
    // ViewChild is set
    this.slides.isBeginning().then(isBeginning => {
      this.isFirstSlide = isBeginning;
    });
    this.slides.isEnd().then(isEnd => {
      this.isLastSlide = isEnd;
    });

    // Subscribe to changes
    this.slides.ionSlideWillChange.subscribe(changes => {
      this.slides.isBeginning().then(isBeginning => {
        this.isFirstSlide = isBeginning;
      });
      this.slides.isEnd().then(isEnd => {
        this.isLastSlide = isEnd;
      });
    });
  }

  skipWalkthrough(): void {
    // Skip to the last slide
    this.slides.length().then(length => {
      this.slides.slideTo(length);
    });
  }

  getStarted(type) {
    
    // this.storage.setItem('TUTORIAL_COMPLETED', true).then(data => {
    this.storage.setItem(constString.TUTORIAL_COMPLETED, "true").then(data => {
      if(type == 'start')
        this.router.navigate(['getting-started'])
      if(type == 'login')
        this.router.navigate(['auth/login'])
    })
  }
}
