import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureSearchBarModule } from '@evaluator/feature-search-bar';
import { ResultsModule } from '@evaluator/feature/results';
import { DataAccessPuppeteerModule, PuppeteerService } from '@evaluator/data-access-puppeteer';
import { Subscription } from 'rxjs';
import { Message, MessageResult } from '@evaluator/shared-types';

@Component({
  selector: 'evaluator-feature-home',
  standalone: true,
  imports: [CommonModule, FeatureSearchBarModule, ResultsModule, DataAccessPuppeteerModule],
  templateUrl: './feature-home.component.html',
  styleUrls: ['./feature-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  results: MessageResult[] = [];
  url = '';
  hasResponse = false;

  private getMessageSubscription?: Subscription;

  constructor(private readonly puppeteerService: PuppeteerService, private readonly changeDetectorRef: ChangeDetectorRef) {
  }

  private setMessageSubscription() {
    this.getMessageSubscription = this.puppeteerService.getMessage()?.subscribe(async (message: Promise<boolean | MessageResult>) => {
      const result = await message;
      if (!result) {
        this.hasResponse = true;
        this.changeDetectorRef.detectChanges();
      } else {
        this.results?.push(result as MessageResult);
      }
    }) as Subscription;
  }

  send(message: Message) {
    this.results = [];
    this.hasResponse = false;
    this.url = message.url;
    this.puppeteerService.sendMessage(message);
    this.setMessageSubscription();
  }

  ngOnDestroy(): void {
    this.getMessageSubscription && this.getMessageSubscription.unsubscribe();
  }
}
