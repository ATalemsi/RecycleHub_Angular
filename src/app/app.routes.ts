import { Routes } from '@angular/router';
import {AuthGuard} from "./Guards/auth.guard";
import {ParticulierGuard} from "./Guards/particulier.guard";
import {CollectorGuard} from "./Guards/collector.guard";
import {WasteRequestResolver} from "./shared/resolvers/waste-request.resolver";

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: "profile",
    loadComponent: () =>
      import("./features/profile/profile-user/profile-user.component").then((m) => m.ProfileUserComponent),
    canActivate: [AuthGuard],
  },
  {
    path: "collections",
    loadComponent: () =>
      import("./features/collecte/particulier-collections/particulier-collections.component").then(
        (m) => m.ParticulierCollectionsComponent,
      ),
    canActivate: [AuthGuard, ParticulierGuard],
    resolve: {
      wasteRequests: WasteRequestResolver,
    },
  },
  {
    path: "collections/add",
    loadComponent: () =>
      import("./features/collecte/collection-request-form/collection-request-form.component").then(
        (m) => m.CollectionRequestFormComponent,
      ),
    canActivate: [AuthGuard, ParticulierGuard],
  },
  {
    path: "collections/edit/:id",
    loadComponent: () =>
      import("./features/collecte/collection-request-form/collection-request-form.component").then(
        (m) => m.CollectionRequestFormComponent,
      ),
    canActivate: [AuthGuard, ParticulierGuard],
  },
  {
    path: "collections/dashboard",
    loadComponent: () =>
      import("./features/collecte/waste-collector/waste-collector.component").then((m) => m.WasteCollectorComponent),
    canActivate: [AuthGuard, CollectorGuard],
  },
  {
    path: "rewards",
   loadComponent: () =>
      import("./features/points/voucher-display/voucher-display.component").then((m) => m.VoucherDisplayComponent),
    canActivate: [AuthGuard , ParticulierGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirection par défaut vers login
  { path: '**', redirectTo: 'login' }, // Redirection pour les routes inconnues
];
