import { type ApplicationConfig, isDevMode } from "@angular/core"
import { provideRouter } from "@angular/router"
import { routes } from "./app.routes"
import { type MetaReducer, provideStore } from "@ngrx/store"
import { provideEffects } from "@ngrx/effects"
import { provideStoreDevtools } from "@ngrx/store-devtools"
import { AuthEffects } from "./core/state/auth/auth.effects"
import { authReducer } from "./core/state/auth/auth.reducer"
import { provideHttpClient } from "@angular/common/http"
import { localStorageSync } from "ngrx-store-localstorage"
import {
  wasteRequestReducer
} from "./core/state/collection-requests/collection-requests.reducer"
import {
  WasteRequestEffects
} from "./core/state/collection-requests/collection-requests.effects"

export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({
    keys: ['auth'],
    rehydrate: true,
    storage: sessionStorage, // Use sessionStorage instead of localStorage
  })(reducer);
}

const metaReducers: MetaReducer[] = [localStorageSyncReducer]

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideStore(
      {
        auth: authReducer,
        wasteRequests: wasteRequestReducer
      },
      { metaReducers },
    ),
    provideEffects([AuthEffects, WasteRequestEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() }),
    provideHttpClient(),
  ],
}

