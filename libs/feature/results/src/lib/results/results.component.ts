import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';
// import { fadeInOut } from './fadeInOut';

@Component({
  selector: 'evaluator-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  // animations: [
  //   fadeInOut
  // ],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ResultsComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() url = '';
  @Input() hasResponse = false;
  @HostBinding('class.filled') get result() { return this.hasResponse && this.url; }

  openStackTraces: boolean[] = [];

  ngOnInit(): void { };

  openStackTrace(event: Event, index: number): void {
    event.preventDefault();
    this.openStackTraces[index] = !this.openStackTraces[index];
  }

  isOpenStackTrace(index: number): boolean {
    return this.openStackTraces[index];
  }
}
