import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'evaluator-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit {
  @Output() send = new EventEmitter<string>;

  value = '';
  isValid = false;
  private _value = ''; // memoize value to compare

  ngOnInit(): void { }

  onSend(value: string) {
    if (this.isValid && value && (value != this._value)) {
      this.send.emit(value);
      this._value = value;
    }
  }

}
