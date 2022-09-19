import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'evaluator-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ResultsComponent implements OnInit {
  @Input() results: any[] = [];

  constructor() { }

  ngOnInit(): void { }
}
