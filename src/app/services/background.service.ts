import { Injectable } from '@angular/core';
import { BackgroundMessage, Port } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private readonly port: Port;

  constructor() {
    try {
      this.port = chrome.runtime.connect();
      this.port.onDisconnect.addListener(() => console.warn('Background service disconnected'));
    } catch (error) {
      console.warn(error);
    }
  }

  sendMessage(message: BackgroundMessage) {
    try {
      this.port.postMessage(message);
    } catch (error) {
      console.warn(error);
    }
  }
}
