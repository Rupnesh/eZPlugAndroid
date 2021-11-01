import { Component, OnInit, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular';

import { DashBoardService } from '../../dashboard/dashboard.service';
import { constString } from '../../constString';
import { LoaderService } from '../../services/loading.service'
import { AlertService } from '../../services/alert.service'
import { Router } from '@angular/router'
import { AlertController } from '@ionic/angular';
@Component({
	selector: 'app-search',
	templateUrl: './search-modal.html',
	styleUrls: ['./search-modal.scss'],
})
export class SearchModal implements OnInit {

	itemArray: any = [];
	siteList: any = [];
	term: string = '';

	stationList: any = [];
	pricingDetails:any = "";
	stationListError:any = false;
	userLocation:any;
	pageLimit:any = 10;
	searchLoader: boolean;

	@ViewChild('mainSearchbar', {static: true}) searchBar: IonSearchbar;

	constructor(public router: Router, private dashboardService: DashBoardService, public loaderService: LoaderService,
		public alertController: AlertController,
		public alertService: AlertService
	) {

	}
	async ngOnInit() {		
		
		this.userLocation = await this.dashboardService.getObject(constString.USER_LOCATION)
		let dataObj = { 
			"SearchString": '', 
			"Lattitude": this.userLocation ? this.userLocation.Lattitude : 18.5204, 
			"Longitude": this.userLocation ? this.userLocation.Longitude : 73.8567,
			"Limit" : this.pageLimit
		}
		this.searchSiteData(dataObj)
		setTimeout(() => {
      this.searchBar.setFocus();
    }, 100);
	}

	toggleGroup(item, index) {

		this.stationList = []
		this.stationListError = false;
		this.dashboardService.setObject(item, constString.SITE_DETAILS).then(data => {
			// item.show = !item.show; 

			this.siteList.map((itemdata, indexdata) => {
				if (item.siteID === itemdata.siteID) {
					itemdata.show = true;
				}
				else {
					itemdata.show = false;
				}

			})

			this.dashboardService.getStationList(item.siteID).subscribe(data => {
				if (data.hasError === false) {
					this.stationList = data.stationViewModels;
					this.pricingDetails = data.pricingDetails;
					this.dashboardService.setItem(data.pricingDetails , constString.PRICING_DETAILS)
					this.stationListError = true;
				}
				else {
					this.alertService.presentToast(data.errorDescription)
					this.stationListError = true;
				}
			}, (error: any) => {
				this.stationListError = true;
				this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
			})

		})
	}
	isGroupShown(item) {
		return item.show;
	};

	loadMoreSites(infiniteScroll) {
		this.pageLimit = this.pageLimit + 10;
		let dataObj = { 
			"SearchString": '', 
			"Lattitude": this.userLocation ? this.userLocation.Lattitude : 18.5204, 
			"Longitude": this.userLocation ? this.userLocation.Longitude : 73.8567,
			"Limit" : this.pageLimit
		}
		this.searchSiteData(dataObj)
		setTimeout(()=> {
			infiniteScroll.target.complete();
		},500)
	}


	searchSiteData(dataObj) {
		// this.loaderService.showLoader('Please wait...');
		this.searchLoader = true;
		this.dashboardService.searchSiteData(dataObj).subscribe(res => {
			if (res.hasError === false) {
				// this.loaderService.hideLoader();
				this.siteList = res.siteViewModels;
				this.searchLoader = false
			}
			else {
				this.alertService.presentToast(res.errorDescription)
			}
		}, (error: any) => {
			// this.loaderService.hideLoader();
			this.alertService.presentToast(constString.HTTP_RESPONSE_ERROR)
		})

		
	}


	async searchFn(ev: any) {
		ev.preventDefault();
		setTimeout(() => {
      this.searchBar.setFocus();
    }, 100);
		if (ev.target.value == undefined || ev.target.value == "" || ev.target.value == null) {
			this.siteList = [];
			let dataObj = { 
				"SearchString": '', 
				"Lattitude": this.userLocation ? this.userLocation.Lattitude : 18.5204, 
				"Longitude": this.userLocation ? this.userLocation.Longitude : 73.8567,
				"Limit" : this.pageLimit
			}
			this.searchSiteData(dataObj)
		}
		else {
			this.siteList = [];
			if (ev.target.value.length === 2 || ev.target.value.length === 4 || ev.target.value.length === 6 || ev.target.value.length === 8) {
				
					let dataObj = { 
						"SearchString": ev.target.value, 
						"Lattitude": this.userLocation ? this.userLocation.Lattitude : 18.5204, 
						"Longitude": this.userLocation ? this.userLocation.Longitude : 73.8567,
						"Limit" : this.pageLimit
					}
					
					this.searchSiteData(dataObj)

			}

		}

	}

	stationDetails(station) {
		this.dashboardService.setObject(station, constString.STATION_DETAILS).then(data => {
			this.router.navigate(['app/station-details'])
		});
		// if (station.isAvailable && station.isConnectedToIoTHub) {
		// 	this.dashboardService.setObject(station, constString.STATION_DETAILS).then(data => {
		// 		this.router.navigate(['app/station-details'])
		// 	});
		// }
		// else {
		// 	this.alertService.presentToast(constString.STATION_AVAILABILITY_MESSAGE)
		// }
	}

	onClear(ev: any) {
		// ev.target.value = '';
		// this.term = ''
		let dataObj = { 
			"SearchString": '', 
			"Lattitude": this.userLocation ? this.userLocation.Lattitude : 18.5204, 
			"Longitude": this.userLocation ? this.userLocation.Longitude : 73.8567,
			"Limit" : this.pageLimit
		}
		this.searchSiteData(dataObj)
	}
	closeModal() {
	}
}