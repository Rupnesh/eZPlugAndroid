import { Injectable, OnInit } from '@angular/core';
import * as signalR from "@aspnet/signalr";
import { IHttpConnectionOptions } from '@aspnet/signalr';

import { StorageService } from '../services/storage.service';
import { constString } from '../constString';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class SignalRService {
	userID;
	options: IHttpConnectionOptions
	data;

	consumedUnits = new Subject<any>();
	consumedCost = new Subject<any>();
	consumedTime = new Subject<any>();
	
	private subjectStatus = new Subject<any>();
	private subjectTimer = new Subject<any>();
	private hubConnection: signalR.HubConnection;

	constructor(private storageService: StorageService) {
		
	}
	

	public startConnection = (userData) => {

		if (userData) {
			this.userID = userData.user.userId;
			let token = userData.accessToken.token
			this.options = {
				accessTokenFactory: () => {
					return token;
				},
				skipNegotiation: true,
				transport: signalR.HttpTransportType.WebSockets
			}
			this.hubConnection = new signalR.HubConnectionBuilder()
			
				.withUrl(`${environment.API_URL}notifytransaction`, this.options)
				// .withUrl('https://ezcharge-api.azurewebsites.net/notifytransaction', this.options)
				.configureLogging(signalR.LogLevel.Debug)
				.build();

			this.hubConnection.start()
				.then(() => {
					console.log('Connection started');
				})
				.catch(err => console.log('Error while starting connection: ' + err))
		}
	}

	notifyTransactionListener(stationName): Observable<any> {
		this.hubConnection.invoke("StoreConnectionId", stationName, 1).catch(err => console.error(err.toString()))
		this.hubConnection.on('notifytransaction', (data) => {
			this.subjectStatus.next(data);
		});
		return this.subjectStatus.asObservable();
	}
	getUnitsConsumed(): Observable<any> {
		return this.subjectStatus.asObservable();
	}
	notifyTransactionTimer(transactionID, siteName, type): Observable<any> {
		this.hubConnection.invoke("GetTimeSpentCharging", transactionID, siteName, type).catch(err => console.error(err.toString()))
		this.hubConnection.on('notifyTime', (data) => {
			this.subjectTimer.next(data);
		});
		return this.subjectTimer.asObservable();
	}
	getTimeConsumed(): Observable<any> {
		return this.subjectTimer.asObservable();
		
	}
	stopTransaction() {
		this.hubConnection.stop();
	}

}