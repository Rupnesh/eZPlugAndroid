import { Injectable } from '@angular/core';
import { Storage} from '@capacitor/storage'

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // JSON "set" example
  async setObject(key, data) {
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

  async setItem(key, value) { 
    await Storage.set({
      key: key,
      value: value
    });
  }

  async getItem(key: string) {
    const { value } = await Storage.get({ key: key });
    return value;
  }

  async getItem11(key: string): Promise<any> {
    const item = await Storage.get({ key: key.toString() });
    return item.value;
  }

  async getItem1(key: string): Promise<{ value: any }> {
    return (await Storage.get({ key }));
  }

  async removeItem() {
    await Storage.remove({ key: 'LOGIN_STATUS' }); 
    await Storage.remove({ key: 'OTP_SESSION' }); 
    await Storage.remove({ key: 'USER_LOCATION' }); 
    await Storage.remove({ key: 'STATION_DETAILS' }); 
    await Storage.remove({ key: 'PRICING_DETAILS' }); 
    await Storage.remove({ key: 'STATION_DETAILS_DATA' }); 
    await Storage.remove({ key: 'SITE_DETAILS' }); 
    await Storage.remove({ key: 'PAYMENT_ORDER_DATA' }); 
    await Storage.remove({ key: 'USER_LANGUAGE' }); 
    await Storage.remove({ key: 'STATION_DETAILS_INFO' }); 
    await Storage.remove({ key: 'SELECTED_CHARGING_OPTIONS' }); 
    await Storage.remove({ key: 'TRANSACTION_ID' }); 
  }

  async keys() {
    const { keys } = await Storage.keys();
  }

  async clear() {
    await Storage.clear();
  }

}
