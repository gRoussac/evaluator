import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, InjectionToken, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { FunctionsService } from '@evaluator/data-accesss-functions';
import { Fonctions, Message } from '@evaluator/shared-types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'evaluator-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() send = new EventEmitter<Message>;

  url = '';
  fn = '';
  isValid = false;
  functions: Fonctions = {};
  functionsKeys?: string[];
  private _url_value = ''; // memoize value to compare
  private functionsServiceSubscription?: Subscription;
  private isBrowser: boolean = isPlatformBrowser(this.platformId);

  constructor(
    @Inject(PLATFORM_ID) private platformId: InjectionToken<object>,
    private readonly functionsService: FunctionsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }
    this.functionsServiceSubscription = this.functionsService.get().subscribe((functions) => {
      this.functionsKeys = Object.keys(functions);
      this.functions = functions;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (this.functionsServiceSubscription) {
      this.functionsServiceSubscription.unsubscribe();
    }
  }

  onSend(url: string, fn: string) {
    if (this.isValid && url && (url != this._url_value)) {
      this.send.emit({
        url,
        fn
      });
      this._url_value = url;
    }
  }

  setFn(event: Event) {
    this.fn = (event.target as HTMLInputElement).value as string;
  }

}
