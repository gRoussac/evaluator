import { enableProdMode, ImportedNgModuleProviders, importProvidersFrom, Provider } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';

import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const ROUTES: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@evaluator/feature-home').then((m) => m.FEATUREHOME_ROUTES),
  },
];

const providers: Array<Provider | ImportedNgModuleProviders> = [
  importProvidersFrom([
    BrowserAnimationsModule,
    RouterModule.forRoot(ROUTES)
  ])
];

bootstrapApplication(AppComponent, { providers })
  .then(() => {
    //
  })
  .catch(() => {
    //
  });

