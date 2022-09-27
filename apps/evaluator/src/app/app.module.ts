import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HIGHLIGHT_WEBWORKER_FACTORY } from '@evaluator/util-hightlight-webworker';
import PromiseWorker from 'promise-worker';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    RouterModule.forRoot(
      [
        {
          path: '',
          loadChildren: () =>
            import('@evaluator/feature-home').then((m) => m.FEATUREHOME_ROUTES),
        },
      ],
      { initialNavigation: 'enabledBlocking' }
    ),
  ],
  providers: [
    {
      provide: HIGHLIGHT_WEBWORKER_FACTORY,
      useValue: function (): [Worker, PromiseWorker] {
        const worker = new Worker(new URL(
          'libs/util/hihlight-webworker/src/lib/util-hihlight-webworker', import.meta.url), {
          name: 'highlight.worker',
          type: 'module',
        });
        return [worker, new PromiseWorker(worker)];
      },
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
