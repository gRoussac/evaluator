import { Injectable } from '@angular/core';
import { Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { map, Observable } from 'rxjs';
import { Message, MessageResult } from '@evaluator/shared-types';
import { HighlightService } from '@evaluator/util-hightlight-webworker';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WEBSOCKET } from './webSocket.token';

@Injectable({
  providedIn: null
})
export class PuppeteerService {
  private window: Window;
  private url: URL;
  private webSocket!: WebSocketSubject<Message | MessageResult>;

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(WEBSOCKET) private readonly webSockeFactory: typeof webSocket,
    private readonly highlightService: HighlightService
  ) {
    this.window = this.document.defaultView as Window;
    this.url = new URL(this.window.location.href.replace('http', 'ws'));
  }

  private connectWebSocket() {
    this.webSocket = this.webSockeFactory(this.url.origin.replace('4200', '4000'));
  }

  getMessage(): Observable<Promise<MessageResult | boolean>> {
    return this.webSocket.pipe(map(async (message) => {
      if (!message) {
        this.highlightService.terminateWorker();
        this.webSocket?.complete();
      }
      this.highlightService.activateWorker();
      return await this.highlightService.highlightMessage(message)
        .catch((err: object) => {
          console.log(err);
          return message;
        }) as MessageResult;
    }));
  }

  sendMessage(message: Message): void {
    if (message) {
      this.connectWebSocket();
      this.webSocket?.next(message);
    }
  }
}
