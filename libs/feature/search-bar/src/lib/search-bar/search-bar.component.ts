import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'evaluator-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit {
  @Output() send = new EventEmitter<string>;

  inputValue = '';

  ngOnInit(): void { }

  onSend(message: string) {
    this.send.emit(message);
  }

}
