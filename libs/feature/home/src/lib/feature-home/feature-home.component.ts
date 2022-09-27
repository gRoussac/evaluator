import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureSearchBarModule } from '@evaluator/feature-search-bar';
import { ResultsModule } from '@evaluator/feature/results';
import { DataAccessPuppeteerModule, PuppeteerService } from '@evaluator/data-access-puppeteer';
import { Subscription } from 'rxjs';

@Component({
  selector: 'evaluator-feature-home',
  standalone: true,
  imports: [CommonModule, FeatureSearchBarModule, ResultsModule, DataAccessPuppeteerModule],
  templateUrl: './feature-home.component.html',
  styleUrls: ['./feature-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnDestroy {
  results: any[] = [];
  url = '';
  hasResponse = false;

  private getMessageSubscription: Subscription = new Subscription();

  constructor(private readonly puppeteerService: PuppeteerService, private readonly changeDetectorRef: ChangeDetectorRef) { }

  private setMessageSubscription() {
    this.getMessageSubscription = this.puppeteerService.getMessage()?.subscribe(async (message: Promise<unknown>) => {
      const result = await message;
      if (result) {
        this.results.push(result);
      } else {
        this.hasResponse = true;
        this.changeDetectorRef.detectChanges();
      }
    }) as Subscription;
  }

  send(message: string) {
    this.results = [];
    this.hasResponse = false;
    this.url = message;
    this.puppeteerService.sendMessage(message);
    this.setMessageSubscription();
  }

  ngOnDestroy(): void {
    this.getMessageSubscription && this.getMessageSubscription.unsubscribe();
  }
}
