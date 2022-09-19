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

  ngOnInit(): void { }

  onChange(event: Event) {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }

  onEnter() {
    this.enter.emit();
  }
}
