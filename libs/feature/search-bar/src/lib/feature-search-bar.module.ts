import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { InputModule } from '@evaluator/ui-input';

@NgModule({
  imports: [CommonModule, InputModule],
  declarations: [SearchBarComponent],
  exports: [SearchBarComponent]
})
export class FeatureSearchBarModule { }
