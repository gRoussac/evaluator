import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'evaluator-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit {

  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() enter = new EventEmitter<void>();
  @Input() isValid = false;
  @Output() isValidChange = new EventEmitter<boolean>();

  private _value = ''; // memoize value to compare

  ngOnInit(): void { }

  onChange(event: Event) {
    const element = (event.target as HTMLInputElement);
    this.isValidChange.emit(element.checkValidity());
    this.valueChange.emit(element.value.trim());
  }

  onEnter() {
    if (this.isValid && (this.value != this._value)) {
      this.enter.emit();
      this._value = this.value;
    }
  }
}
