import { Injectable } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { InjectionToken } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { map, Observable } from 'rxjs';
import { HIGHLIGHT_WEBWORKER_FACTORY } from '@evaluator/util-hightlight-webworker';
import PromiseWorker from 'promise-worker';

@Injectable({
  providedIn: null
})
export class PuppeteerService {

  private isBrowser: boolean = isPlatformBrowser(this.platformId);
  private window: Window;
  private myWebSocket: WebSocketSubject<any> | undefined = undefined;
  private hightlightWebworker: Worker | undefined = undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>,
    @Inject(DOCUMENT) private document: Document,
    @Inject(HIGHLIGHT_WEBWORKER_FACTORY) private highlightWebworkerFactory: () => Worker
  ) {
    this.window = this.document.defaultView as Window;
    if (this.isBrowser) {
      this.connect();
      this.hightlightWebworker = this.highlightWebworkerFactory();
    }
  }

  getMessage(): Observable<Promise<unknown | boolean>> | undefined {
    return this.myWebSocket?.asObservable().pipe(map(async (message) => {
      if (!message || !this.hightlightWebworker) {
        return false;
      }
      const promiseWorker = new PromiseWorker(this.hightlightWebworker);
      message = await promiseWorker.postMessage(message).catch(err => {
        console.log(err);
      });
      return message;
    }));
  }

  send(message: string): void {
    //   console.log(this.myWebSocket?.closed);
    if (this.myWebSocket?.closed) {
      this.connect();
    }
    if (message) {
      this.myWebSocket?.next(message);
    }
  }

  private connect() {
    this.myWebSocket = webSocket(this.window.location.href.replace('http', 'ws').replace('4200', '4000'));
  }
}
