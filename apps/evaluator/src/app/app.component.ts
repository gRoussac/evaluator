import { Component, InjectionToken } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'evaluator-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'evaluator';
  private isBrowser: boolean = isPlatformBrowser(this.platformId);
  private window: Window;

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.window = this.document.defaultView as Window;
    if (this.isBrowser) {
      console.log(this.window.location.href.replace('http', 'ws') + 'ws');
      const myWebSocket = webSocket(this.window.location.href.replace('http', 'ws') + 'ws');

      myWebSocket.asObservable().subscribe(dataFromServer => {
        console.log(dataFromServer);
      });

      myWebSocket.next(JSON.stringify({}));

    }

  }






}
