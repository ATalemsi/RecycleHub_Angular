import { createSelector, createFeatureSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';
import { User } from '../../../shared/models/user.model';

// Select the auth feature state
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Select the user from auth state
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState): User | null => state.user
);

// Select the error state
export const selectError = createSelector(
  selectAuthState,
  (state: AuthState): string | null => state.error
);

// Select the loading state
export const selectLoading = createSelector(
  selectAuthState,
  (state: AuthState): boolean => state.loading
);

// Select all collectors
export const selectAllCollecteurs = createSelector(
  selectAuthState,
  (state: AuthState): User[] => state.collecteurs || []
);

// Select collectors error
export const selectCollecteursError = createSelector(
  selectAuthState,
  (state: AuthState): string | null => state.error
);

// Select authentication status
export const selectIsAuthenticated = createSelector(
  selectUser,
  (user: User | null): boolean => !!user
);
