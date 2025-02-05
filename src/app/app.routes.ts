import { Routes } from '@angular/router';
import {AuthGuard} from "./Guards/auth.guard";

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
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirection par défaut vers login
  { path: '**', redirectTo: 'login' }, // Redirection pour les routes inconnues
];
