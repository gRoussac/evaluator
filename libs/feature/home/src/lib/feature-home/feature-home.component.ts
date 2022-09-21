import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureSearchBarModule } from '@evaluator/feature-search-bar';
import { ResultsModule } from '@evaluator/feature/results';
import { DataAccessPuppeteerModule, PuppeteerService } from '@evaluator/data-access-puppeteer';

@Component({
  selector: 'evaluator-feature-home',
  standalone: true,
  imports: [CommonModule, FeatureSearchBarModule, ResultsModule, DataAccessPuppeteerModule],
  templateUrl: './feature-home.component.html',
  styleUrls: ['./feature-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  results: any[] = [];
  url = '';
  hasResponse = false;

  constructor(private readonly puppeteerService: PuppeteerService, private readonly changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.puppeteerService.getMessage()?.subscribe((message) => {
      message && this.results.push(message);
      this.hasResponse = true;
      this.changeDetectorRef.detectChanges();
    });
  }

  send(message: string) {
    this.results = [];
    this.hasResponse = false;
    this.url = message;
    this.puppeteerService.send(message);
  }
}
