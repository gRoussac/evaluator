import { ChangeDetectionStrategy, Component, HostBinding, Input } from '@angular/core';
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
export class ResultsComponent {
  @Input() results: any[] = [];
  @Input()
  set url(value: string) {
    this._url = value;
    this.openStackTraces = [];
  }
  get url() {
    return this._url;
  }
  @Input() hasResponse = false;
  @HostBinding('class.filled') get result() { return this.hasResponse && this.url; }

  private _url = '';

  openStackTraces: boolean[] = [];

  openStackTrace(event: Event, index: number): void {
    event.preventDefault();
    this.openStackTraces[index] = !this.openStackTraces[index];
  };

  isOpenStackTrace(index: number): boolean {
    return this.openStackTraces[index];
  }
}
