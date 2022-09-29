import { Injectable } from '@angular/core';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { map, Observable } from 'rxjs';
import { HIGHLIGHT_WEBWORKER_FACTORY } from '@evaluator/util-hightlight-webworker';
import PromiseWorker from 'promise-worker';
import { Message, MessageResult } from '@evaluator/shared-types';

@Injectable({
  providedIn: null
})
export class PuppeteerService {
  private window: Window;
  private url: URL;
  private webSocket?: WebSocketSubject<any>;
  private webworker?: Worker;
  private hightlightWebworker?: PromiseWorker;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(HIGHLIGHT_WEBWORKER_FACTORY) private highlightWebworkerFactory: () => [Worker, PromiseWorker]
  ) {
    this.window = this.document.defaultView as Window;
    this.url = new URL(this.window.location.href.replace('http', 'ws'));
  }

  private connectWebSocket() {
    this.webSocket = webSocket(this.url.origin.replace('4200', '4000'));
  }

  getMessage(): Observable<Promise<MessageResult | boolean>> | undefined {
    return this.webSocket?.pipe(map(async (message) => {
      this.activateWorker();
      message = await this.hightlightWebworker?.postMessage(message).catch((err: object) => {
        console.log(err);
      });
      if (!message) {
        this.terminateWorker();
        this.webSocket?.complete();
      }
      return message;
    }));
  }

  sendMessage(message: Message): void {
    if (message) {
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
