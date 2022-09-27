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
  private url: URL;
  private webSocket: WebSocketSubject<any> | undefined = undefined;
  private webworker: Worker | undefined = undefined;
  private hightlightWebworker: PromiseWorker | undefined = undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>,
    @Inject(DOCUMENT) private document: Document,
    @Inject(HIGHLIGHT_WEBWORKER_FACTORY) private highlightWebworkerFactory: () => [Worker, PromiseWorker]
  ) {
    this.window = this.document.defaultView as Window;
    this.url = new URL(this.window.location.href.replace('http', 'ws'));
  }

  private connectWebSocket() {
    this.webSocket = webSocket(this.url.origin.replace('4200', '4000'));
  }

  getMessage(): Observable<Promise<unknown | boolean>> | undefined {
    return this.webSocket?.pipe(map(async (message) => {
      this.activateWorker();
      message = await this.hightlightWebworker?.postMessage(message).catch((err: unknown) => {
        console.log(err);
      });
      if (!message) {
        this.terminateWorker();
        this.webSocket?.complete();
      }
      return message;
    }));
  }

  sendMessage(message: string): void {
    if (this.isBrowser && message) {
      this.connectWebSocket();
      this.webSocket?.next(message);
    }
  }

  activateWorker() {
    if (this.webworker) { return; }
    const factory = this.highlightWebworkerFactory();
    this.webworker = factory[0] as Worker;
    this.hightlightWebworker = factory[1] as PromiseWorker;
  }

  terminateWorker() {
    if (!this.webworker) { return; }
    this.webworker.terminate();
    delete (this.webworker);
  }

}
