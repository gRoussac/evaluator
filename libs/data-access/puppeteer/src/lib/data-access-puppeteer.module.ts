import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PuppeteerService } from './puppeteer.service';

@NgModule({
  imports: [CommonModule],
  providers: [PuppeteerService]
})
export class DataAccessPuppeteerModule { }
