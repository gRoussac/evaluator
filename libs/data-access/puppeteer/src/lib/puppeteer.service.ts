import { Injectable } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { InjectionToken } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: null
})
export class PuppeteerService {

  private isBrowser: boolean = isPlatformBrowser(this.platformId);
  private window: Window;
  private myWebSocket: WebSocketSubject<string> | undefined = undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>,
    @Inject(DOCUMENT) private document: Document) {
    this.window = this.document.defaultView as Window;
    if (this.isBrowser) {
      this.myWebSocket = webSocket(this.window.location.href.replace('http', 'ws').replace('4200', '4000'));
    }
  }

  getMessage(): Observable<string> | undefined {
    return this.myWebSocket?.asObservable();
  }

  send(message: string): void {
    if (message) {
      this.myWebSocket?.next(message);
    }
  };
}
