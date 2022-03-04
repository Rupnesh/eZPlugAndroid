import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from "rxjs/operators";
import { Storage } from '@capacitor/storage';
import { constString } from '../constString';
import { ActiveTransactionForUser } from '../interfaces/activetransaction';

const TRANSACTION_ID = "TRANSACTION_ID" 


@Injectable()
export class DashBoardService {

  // Http Options
  httpOptions: any;
  userLocations: any;
  userID: any = "";


  constructor(private http: HttpClient) {

    // var newYork = moment.tz("2014-06-01 12:00", "America/New_York");
    // var losAngeles = newYork.clone().tz("America/Los_Angeles");
    // var london = newYork.clone().tz("Europe/London");

    // newYork.format();    // 2014-06-01T12:00:00-04:00
    // losAngeles.format(); // 2014-06-01T09:00:00-07:00
    // london.format();     // 2014-06-01T17:00:00+01:00

    this.getObject(constString.OTP_SESSION).then(data => {
      if (data)
        this.userID = data.user.userId;
    })

  }

  public getFavouriteData(userLocation, userID, otpSession): Observable<any> {
    let data = { "UserId": userID, "Lattitude": userLocation.Lattitude ? userLocation.Lattitude: 0, "Longitude": userLocation.Longitude? userLocation.Longitude : 0 }
    return this.http.post<any>(`${constString.PATH_STATION}${constString.FAVOURITE_DATA}`, data);
  }
  public addStationToFavourite(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_STATION}${constString.ADD_FAVOURITE_DATA}`, data);
  }
  public getHistoryData(userLocation, userID, otpSession): Observable<any> {
    let data = { "UserId": userID, "Lattitude": userLocation.Lattitude ? userLocation.Lattitude: 0, "Longitude": userLocation.Longitude? userLocation.Longitude: 0 }
    return this.http.post<any>(`${constString.PATH_STATION}${constString.HISTORY_DATA}`, data);
  }

  public searchSiteData(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_SITE}${constString.SEARCH_SITE}`, data);
  }

  public getNearBySites(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_SITE}${constString.GET_NEARBY_SITE}`, data);
  }

  public getSiteData(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_SITE}${constString.GET_ALL_SITES}`);
  }


  public getStationList(siteID): Observable<any> {
    return this.http.get<any>(`${constString.PATH_STATION}${constString.GET_STATIONBY_SITEID}/${siteID}`);
  }
  public getStationConnectorStatus(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_STATION}${constString.GET_STATION_CONNECTOR_STATUS}`, data);
  }

  public getStationDetails(stationID, userLocation, userID): Observable<any> {
    let data = { "StationId": stationID, "Lattitude": userLocation.Lattitude, "Longitude": userLocation.Longitude, "UserId": userID }
    return this.http.post<any>(`${constString.PATH_STATION}${constString.GET_STATIONBY_ID}`, data);
  }


  public startCharging(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.START_CHARGING}`, data);
  }
  public stopCharging(data): Observable<any> {

    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.STOP_CHARGING}`, data);
  }
  public energyConsumedDetails(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.ENERGY_CONSUMED}`, data);
  }
  public calculateTransactionEstimate(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.CALCULATE_TRANSACTION_ESTIMATE}`, data);
  }
  public notifyChargingDetailsRequest(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.NOTIFY_CHARGING_DETAILS_REQUEST}`, data);
  }


  public unLockDevice(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.UNLOCK_PLUG_REQUEST}`, data);
  }
  public lockStatusOfDevice(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.DOOR_STATUS_REQUEST}`, data);
  }


  public generateInvoice(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.GENERATE_INVOICE}`, data);
  }
  public paymentCreateOrder(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_PAYMENT}${constString.PAYMENT_CREATE_ORDER}`, data);
  }
  public paymentOrderStatus(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_PAYMENT}${constString.ORDER_STATUS}`, data);
  }
  public getPaymentLink(orderID): Observable<any> {
    return this.http.get<any>(`${constString.PATH_PAYMENT}${constString.GET_PAYMENT_LINK}/${orderID}`);
  }

  public addVehicle(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_USER}${constString.ADD_VEHICLE}`, data);
  }
  public updateVehicle(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_USER}${constString.UPDATE_VEHICLE}`, data);
  }
  public deleteVehicle(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_USER}${constString.DELETE_VEHICLE}`, data);
  }
  public getAllActiveVehicles(userID): Observable<any> {
    return this.http.get<any>(`${constString.PATH_USER}${constString.GET_ALL_ACTIVE_VEHICLES}/${userID}`);
  }
  public getUserTransactions(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_USER}${constString.GET_USER_TRANSACTIONS}`);
  }
  public registerUserForPushNotifications(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_USER}${constString.REGISTER_USER_FOR_PUSH_NOTIFICATIONS}`, data);
  }
  public getFAQS(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_USER}${constString.GET_FAQ}`);
  }

  public getActiveTransactionForUser(): Observable<ActiveTransactionForUser> {
    return this.http.get<ActiveTransactionForUser>(`${constString.PATH_USER}${constString.GET_ACTIVE_TRANSACTION_FOR_USER}`);
    // return this.http.get<any>(`${constString.PATH_USER}${constString.GET_ACTIVE_TRANSACTION_FOR_USER}`);
  }
  public getInvoiceDetailsForTransaction(tid): Observable<any> {
    return this.http.get<any>(`${constString.PATH_USER}${constString.GET_INVOICE_DETAILS_FOR_TRANSACTION}/${tid}`);
  }
  public storeAppHaskKey(haskKey): Observable<any> {
    return this.http.post<any>(`${constString.PATH_USER}${constString.STORE_APP_HASK_KEY}?hashKey=${haskKey}`,null);
  }



  public getUserById(userID): Observable<any> {
    return this.http.get<any>(`${constString.PATH_ACCOUNT}${constString.GET_USER_BY_ID}/${userID}`);
  }
  public updateUserDetails(data): Observable<any> { 
    return this.http.post<any>(`${constString.PATH_ACCOUNT}${constString.UPDATE_USER_DETAILS}`, data);
  }

  //WALLET
  public getWalletBalance(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_WALLET}${constString.GET_WALLET_BALANCE}`);
  }
  public getWalletDetails(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_WALLET}${constString.GET_WALLET_DETAILS}`);
  }
  
  public getRechargeWalletOrderStatus(orderID): Observable<any> {
    return this.http.post<any>(`${constString.PATH_WALLET}${constString.GET_RECHARGE_WALLET_ORDER_STATUS}${orderID}`, null);
  }
  public rechargeWallet(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_WALLET}${constString.RECHARGE_WALLET}`, data);
  }
  public checkMinimumWalletBalanceMaintained(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_WALLET}${constString.CHECK_MINIMUM_WALLET_BALANCE}`);
  }
  public makePaymentUsingWallet(data): Observable<any> {
    return this.http.post<any>(`${constString.PATH_TRANSACTION}${constString.MAKE_PAYMENT_USING_WALLET}`, data);
  }
  


  public getLatestVersionOfApp(): Observable<any> {
    return this.http.get<any>(`${constString.PATH_VERSION}${constString.GET_LATEST_VERSION_APP}/MobileApplication`);
  }

  

  getUsers() {
    return this.http.get('https://jsonplaceholder.typicode.com/usssers').pipe(retry(2), catchError(this.handleError));
  }
  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }




  async setObject(data, key) {
    await Storage.set({
      key: key,
      value: JSON.stringify(data)
    });
  }

  // JSON "get" example
  async getObject(key) {
    const ret = await Storage.get({ key: key });
    return JSON.parse(ret.value);
  }

  async setItem1(key, value) {
    await Storage.set({
      key: key,
      value: value
    });
  }

  async setItem(data, key) {
    await Storage.set({
      key: key,
      value: data
    });
  }

  async getItem(key: string) {
    const { value } = await Storage.get({ key: key });
    return value;
  }
  async getItem1(key: string): Promise<any> {
    const item = await Storage.get({ key: key.toString() });
    return item.value;
  }

  async removeItem() {
    await Storage.remove({ key: TRANSACTION_ID });
    await Storage.remove({ key: constString.PAYMENT_ORDER_DATA});
    await Storage.remove({ key: constString.IS_CHARGING_ENABLED})
  }
  async removeItemName(key) {
    await Storage.remove({ key: key });
  }

  async keys() {
    const { keys } = await Storage.keys();
    return keys;
  }

  async clear() {
    await Storage.clear();
  }


}
