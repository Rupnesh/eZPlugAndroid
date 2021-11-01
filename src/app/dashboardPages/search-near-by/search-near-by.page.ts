import { Component, ViewChild, OnInit, HostBinding, AfterViewInit } from '@angular/core';
import { LoadingController, Platform, AlertController } from '@ionic/angular';

import { ActivatedRoute } from '@angular/router';
import { Geolocation} from '@capacitor/geolocation'

import { GoogleMapComponent } from '../../components/google-map/google-map.component';
import { Router } from '@angular/router'

import { DashBoardService } from '../../dashboard/dashboard.service';
import { constString } from '../../constString';

import { LoaderService } from '../../services/loading.service'
import { AlertService } from '../../services/alert.service'


@Component({
  selector: 'app-search-near-by',
  templateUrl: './search-near-by.page.html',
  styleUrls: [
    './search-near-by.page.scss',
    './styles/firebase-listing.page.scss',
    './styles/firebase-listing.ios.scss',
    './styles/firebase-listing.shell.scss'],
})
export class SearchNearByPage implements OnInit {

  siteList: any = [];
  showNearbyFilter = false;
  valueSliderRange = 10;

  @ViewChild(GoogleMapComponent, { static: true }) _GoogleMap: GoogleMapComponent;
  map: google.maps.Map;
  mapOptions: google.maps.MapOptions;

  marker: google.maps.Marker[] = [];
  loadingElement: any;
  stationList: any = []

  positionCords: any = {};
  subscription: any;
  stationListError:any = false;
  

  constructor(private loadingController: LoadingController, public router: Router, private route: ActivatedRoute,
    private dashboardService: DashBoardService, public loaderService: LoaderService,private platform: Platform,
    public alertService: AlertService, private alertCtrl: AlertController) { }

  ngOnInit() {
    this.geolocateMe()
  }
  async ionViewDidLoad() { 
    this._GoogleMap.$mapReady.subscribe(map => {
      this.map = map;
      // this.geolocateMe();
    });
    this.positionCords = await this.dashboardService.getObject(constString.USER_LOCATION);
    // this.createLoader();
  }

  async createLoader() {
    this.loadingElement = await this.loadingController.create({
      message: 'Loading...'
    });
  }

  async presentLoader() {
    await this.loadingElement.present();
  }

  async dismissLoader() {
    if (this.loadingElement) {
      await this.loadingElement.dismiss();
    }
  }

  async geolocateMe() {

    // this.loaderService.showLoader('Loading...')
    var markers;

    let position = await Geolocation.getCurrentPosition({})
    this.positionCords = position.coords;
    let lat = 18.56265;
    let lon = 73.779686;

    let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.mapOptions = {
      center: { lat: position.coords.latitude, lng: position.coords.longitude },
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI : true
    }

    this.map = new google.maps.Map(this._GoogleMap._el, this.mapOptions);
    this.valueSliderRange = 10;

    const current_location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    this.map.panTo(current_location);
    let marker = new google.maps.Marker({
      position: current_location,
      title: 'You are here!',
      animation: google.maps.Animation.DROP,
    });
    marker.setMap(this.map);

    let data = {
      "SearchRadius": 10, "Lattitude": Number(position.coords.latitude.toFixed(6)), "Longitude": Number(position.coords.longitude.toFixed(6))
    }

    this.dashboardService.getNearBySites(data).subscribe(data => {
      if (data.hasError === false) {
        // this.loaderService.hideLoader();
        this.siteList = data.siteViewModels;
        this.siteList.sort((a, b) => { return parseFloat(a.distance) - parseFloat(b.distance) });
        markers = this.siteList
        this.setMultipleMarker(markers, this);
      }
      else {
        // this.loaderService.hideLoader();
      }
    }, (error: any) => {
        // this.loaderService.hideLoader();
        this.siteList = []
        this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)      
    })
  }

  clearMarkers() {
    for (let i = 0; i < this.marker.length; i++) {
      this.marker[i].setMap(null);
    }
  }

  setMultipleMarker(markers, self) {
    let infowindow = new google.maps.InfoWindow();
    this.clearMarkers();
    this.marker = [];
    
    for (let i = 0; i < markers.length; i++) {
      let markerToPush = new google.maps.Marker(
        {
          position: new google.maps.LatLng(markers[i].lattitude, markers[i].longitude),
          map: self.map,
          animation: google.maps.Animation.DROP,
          icon: {
            url: "../../assets/dashboard-icons/carcharge.svg",
            scaledSize: new google.maps.Size(36, 36)
          }
        }
      );
      this.marker.push(markerToPush);
      google.maps.event.addListener(markerToPush, 'click', (event) => {
        this.showStationListPrompt(markers[i]);
      });
    }
    this.loaderService.hideLoader();
  }

  async showStationListPrompt(marker) {
    this.stationList = []
    
    this.dashboardService.getStationList(marker.siteID).subscribe(data =>  {
      if (data.hasError === false) {
        this.stationList = data.stationViewModels;
        this.dashboardService.setItem(data.pricingDetails, constString.PRICING_DETAILS)
        this.warn(marker)
      }
      else {
        this.alertService.presentToast(data.errorDescription)
      }
    }, (error: any) => {
      this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
    })
  }

  async warn(marker) {
    let stationListArray = []
    return new Promise(async (resolve) => {
      this.stationList.map(station => {
        stationListArray.push({ type: 'radio', label: station.stationName, value: station })
      })
      let alert = await this.alertCtrl.create({
        header: marker.siteName,
        subHeader: 'Select Station',
        inputs: stationListArray,
        cssClass: 'station-alert',
        buttons: [
          { text: 'Cancel', role: 'cancel',
            handler: () => { }
          },
          { text: 'OK',
            handler: (data) => { 
              this.dashboardService.setObject(data, constString.STATION_DETAILS).then(data => {
                this.router.navigate(['app/station-details'],{replaceUrl:true, state: { nearby: true }})
              })
              // if(data.isAvailable && data.isConnectedToIoTHub) {
              //   this.dashboardService.setObject(data, constString.STATION_DETAILS).then(data => {
              //     this.router.navigate(['app/station-details'],{replaceUrl:true, state: { nearby: true }})
              //   })
              // }
              // else {
              //   this.alertService.presentToast(constString.STATION_AVAILABILITY_MESSAGE)
              // }
            }
          }
        ]
      });
      alert.present();
    })
  }

  markerCliked() {
  } 

  stationDetails(station) {
    this.dashboardService.setObject(station, constString.STATION_DETAILS).then(data => {
      this.router.navigate(['app/station-details'],{replaceUrl:true, state: { nearby: true }})
    })
    // if (station.isAvailable && station.isConnectedToIoTHub) {
    //   this.dashboardService.setObject(station, constString.STATION_DETAILS).then(data => {
    //     this.router.navigate(['app/station-details'],{replaceUrl:true, state: { nearby: true }})
    //   })
    // }
    // else {
    //   this.alertService.presentToast(constString.STATION_AVAILABILITY_MESSAGE)
    // }

  }

  showDeatils(item, index) {

    this.stationList = []
    this.stationListError = false;
    this.dashboardService.setObject(item, constString.SITE_DETAILS).then(data => {

      this.siteList.map((itemdata, indexdata) => {
        if (index === indexdata) {
          itemdata.show = true;
        }
        else {
          itemdata.show = false;
        }

      })

      this.dashboardService.getStationList(item.siteID).subscribe(data => {
        if (data.hasError === false) {
          this.stationList = data.stationViewModels;
          this.dashboardService.setItem(data.pricingDetails, constString.PRICING_DETAILS)
          this.stationListError = true;
        }
        else {
          this.alertService.presentToast(data.errorDescription)
          this.stationListError = true;
        }
      }, (error: any) => {
        this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
        this.stationListError = true;
      })

    })

  }
  isGroupShown(item) {
    return item.show;
  }

  onProgressChangeEnd(event) {
    let data = {
      "SearchRadius": event.target.value, "Lattitude": parseFloat(this.positionCords.latitude), "Longitude": parseFloat(this.positionCords.longitude)
    }
    let markers:any = [];
    this.siteList = []
    // this.loaderService.showLoader('Loading...');

    const current_location = new google.maps.LatLng(this.positionCords.latitude, this.positionCords.longitude);
    this.map.panTo(current_location);
    let marker = new google.maps.Marker({
      position: current_location,
      title: 'You are here!',
    });
    
    marker.setMap(null);
    // marker.setMap(this.map);

    this.dashboardService.getNearBySites(data).subscribe(data => {
      if (data.hasError === false) {
        this.siteList = data.siteViewModels;
        this.siteList.sort((a, b) => { return parseFloat(a.distance) - parseFloat(b.distance) });
        // this.loaderService.hideLoader()
        markers = this.siteList
        this.setMultipleMarker(markers, this);
      }
      else {
        this.alertService.presentToast(data.errorDescription)
        // this.loaderService.hideLoader()
        this.siteList = []
      }
    }, (error: any) => {
      this.siteList = []
      // this.loaderService.hideLoader()
      if (error.status === 401)
        this.alertService.presentAlert(constString.HTTP_UNAUTHORIZED_ERROR, 'auth/login')
    })


  }
  ionViewDidEnter() {
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      // if (this.router.url === '/app/bill') {
      //   this.router.navigate(['./'], { relativeTo: this.route, queryParamsHandling: 'preserve' });
      //   this.alertService.presentToast("Please make the payment...")
      // }
      this.router.navigate(['app/dashboard'])

        
    })
  }

}



