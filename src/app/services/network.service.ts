import { Injectable } from '@angular/core';
import { Plugins, NetworkStatus, PluginListenerHandle } from '@capacitor/core';
const { Network } = Plugins;
@Injectable({
	providedIn: 'root'
})
export class NetworkService {
  networkStatus: NetworkStatus;
  networkListener: PluginListenerHandle;
	constructor() { 
  }
  async getNetworkStatus(): Promise<any> {
    this.networkListener = Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
    });
    return this.networkStatus = await Network.getStatus();
  }

  removeNetworkListener() {
    this.networkListener.remove();
  }

}