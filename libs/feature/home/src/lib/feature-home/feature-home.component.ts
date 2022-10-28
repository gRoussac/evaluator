import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '@evaluator/feature-search-bar';
import { ResultsComponent } from '@evaluator/feature/results';
import { DataAccessPuppeteerModule, PuppeteerService } from '@evaluator/data-access-puppeteer';
import { Subscription } from 'rxjs';
import { Message, MessageResult } from '@evaluator/shared-types';
import { ResultsService } from '@evaluator/shared-services';


@Component({
  selector: 'evaluator-feature-home',
  standalone: true,
  imports: [CommonModule, SearchBarComponent, ResultsComponent, DataAccessPuppeteerModule],
  providers: [ResultsService],
  templateUrl: './feature-home.component.html',
  styleUrls: ['./feature-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  url!: string;
  fn!: string;
  hasResponse!: boolean;

  private getMessageSubscription?: Subscription;

  constructor(
    private readonly puppeteerService: PuppeteerService,
    private readonly resultsService: ResultsService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
  }

  private sendResults() {
    this.getMessageSubscription = this.puppeteerService.getMessage().subscribe(async (message: Promise<MessageResult | boolean>) => {
      const result = await message;
      !result && (this.hasResponse = true) && this.changeDetectorRef.markForCheck();
      result && this.resultsService.sendResult(result as MessageResult);
    });
  }

  send(message: Message) {
    this.hasResponse = false;
    this.url = message.url;
    this.puppeteerService.sendMessage(message);
    this.sendResults();
  }

  setFn(fn: string) {
    fn && (this.fn = fn);
  }

  ngOnDestroy(): void {
    this.getMessageSubscription && this.getMessageSubscription.unsubscribe();
  }
}
