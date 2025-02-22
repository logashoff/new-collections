import { Injectable } from '@angular/core';
import { BackgroundMessage, Port, sleep } from '../utils';

@Injectable({
  providedIn: 'root',
})
export class BackgroundService {
  private port: Port;
  private disconnectCount = 0;
  private readonly maxReconnects = 10;

  constructor() {
    this.createPort();
  }

  private createPort() {
    this.port = chrome.runtime.connect();
    this.port.onDisconnect.addListener(async () => {
      console.warn(`Background service disconnected ${this.disconnectCount + 1}`);

      if (this.disconnectCount < this.maxReconnects) {
        this.disconnectCount++;

        const delay = 2 ** this.disconnectCount * 1_000;

        await sleep(delay);

        this.createPort();
      }
    });
  }

  sendMessage(message: BackgroundMessage) {
    try {
      this.port.postMessage(message);
    } catch (error) {
      console.warn(error);
    }
  }
}
