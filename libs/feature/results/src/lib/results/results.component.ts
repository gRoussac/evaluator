import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

@Component({
  selector: 'evaluator-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ResultsComponent implements OnInit {
  @Input() results: any[] = [];
  @Input() url = '';
  @Input() hasResponse = false;
  @HostBinding('class.filled') get result() { return this.hasResponse && this.url; }

  ngOnInit(): void { }
}
