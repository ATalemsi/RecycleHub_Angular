import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

// Sélecteur pour récupérer l'état de l'authentification
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Sélecteur pour récupérer l'utilisateur
export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);

// Sélecteur pour récupérer l'erreur
export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

// Sélecteur pour récupérer l'état de chargement
export const selectLoading = createSelector(
  selectAuthState,
  (state) => state.loading
);
