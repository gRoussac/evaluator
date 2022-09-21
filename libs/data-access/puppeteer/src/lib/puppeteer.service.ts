import { Injectable } from '@angular/core';
import { Inject, PLATFORM_ID } from '@angular/core';
import { InjectionToken } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { map, Observable } from 'rxjs';
import hljs from 'highlight.js';

@Injectable({
  providedIn: null
})
export class PuppeteerService {

  private isBrowser: boolean = isPlatformBrowser(this.platformId);
  private window: Window;
  private myWebSocket: WebSocketSubject<any> | undefined = undefined;

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>,
    @Inject(DOCUMENT) private document: Document) {
    this.window = this.document.defaultView as Window;
    if (this.isBrowser) {
      this.myWebSocket = webSocket(this.window.location.href.replace('http', 'ws').replace('4200', '4000'));
    }
  }

  getMessage(): Observable<any> | undefined {
    return this.myWebSocket?.asObservable().pipe(map((message) => {
      if (!message) {
        return message;
      }
      message['result'] = message['result'] && hljs.highlight('javascript', message['result']).value;
      message['stacktrace'] = message['stacktrace'] && hljs.highlight('json', JSON.stringify(message['stacktrace'], null, 2)).value;
      return message;
    }));
  }

  send(message: string): void {
    if (message) {
      this.myWebSocket?.next(message);
    }
  };
}
