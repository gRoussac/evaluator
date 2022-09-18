import { Component, InjectionToken } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'evaluator-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'evaluator';
  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  constructor(@Inject(PLATFORM_ID) private platformId: InjectionToken<Record<string, unknown>>) {
    if (this.isBrowser) {
      const myWebSocket = webSocket('ws://localhost:4200');
      myWebSocket.asObservable().subscribe(dataFromServer => {
        console.log(dataFromServer);
      });
    }
  }

  // const ws = new WebSocket('ws://localhost:4200');

  //   ws.on('open', function open() {
  //     ws.send('something');
  //   });

  //   ws.on('message', function message(data: any) {
  //     console.log('received: %s', data);
  //   });


}
