import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {AuthEffects} from "./core/state/auth/auth.effects";
import {authReducer} from "./core/state/auth/auth.reducer";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideStore({auth : authReducer}), provideEffects([AuthEffects]), provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })]
};
