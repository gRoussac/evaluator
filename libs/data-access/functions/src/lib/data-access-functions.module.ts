import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FunctionsService } from './functions.service';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [FunctionsService]
})
export class DataAccessFunctionsModule { }
