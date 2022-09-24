import { InjectionToken } from '@angular/core';

export const HIGHLIGHT_WEBWORKER_FACTORY = new InjectionToken<() => Worker>(
  'highlight'
);